const { defineSecret } = require('firebase-functions/params');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { onRequest } = require('firebase-functions/v2/https');
const twilio = require('twilio');
const admin = require('firebase-admin');

admin.initializeApp();

// Secrets
const TWILIO_SID = defineSecret('TWILIO_SID');
const TWILIO_TOKEN = defineSecret('TWILIO_TOKEN');
const TWILIO_PHONE = defineSecret('TWILIO_PHONE');

const actionCodeSettings = {
  url: 'http://localhost:3000/finishSignIn',
  handleCodeInApp: true,
};

const questions = [
  'What type of consultation do you need?',
  'Please specify the category.',
  'Which country are you calling from?',
  'What is your preferred language?',
  'What is the urgency level of your request?',
  'Please provide your address if necessary.',
  'Could you briefly summarize your request?'
];

const fieldLabels = {
  q0: 'Type of Consultation',
  q1: 'Category',
  q2: 'Country',
  q3: 'Language',
  q4: 'Urgency',
  q5: 'Address',
  q6: 'Summary',
};

// Firestore trigger to initiate the call
exports.callUser = onDocumentCreated(
  {
    document: 'callbackRequests/{docId}',
    secrets: [TWILIO_SID, TWILIO_TOKEN, TWILIO_PHONE],
  },
  async (event) => {
    const client = twilio(TWILIO_SID.value(), TWILIO_TOKEN.value());
    const data = event.data?.data();
    if (!data) return;

    const phone = data.phone;
    const email = data.email;
    if (!phone || !email) {
      console.error('Missing phone or email');
      return;
    }

    const call = await client.calls.create({
      url: 'https://aiwebhook-ghyvqpljtq-uc.a.run.app',
      to: phone,
      from: TWILIO_PHONE.value(),
      method: 'POST',
    });

    const callSid = call.sid;

    // Save call session with email
    await admin.firestore().collection('callSessions').doc(callSid).set({
      email,
      answers: {},
      currentIndex: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Call initiated to ${phone} and email saved: ${email}`);
  }
);

// Twilio webhook for handling the conversation
exports.aiWebhook = onRequest(
  {
    secrets: [TWILIO_SID, TWILIO_TOKEN, TWILIO_PHONE],
  },
  async (req, res) => {
    try {
      const twiml = new twilio.twiml.VoiceResponse();
      const callSid = req.body.CallSid;
      const speechResult = req.body.SpeechResult?.trim();

      const docRef = admin.firestore().collection('callSessions').doc(callSid);
      let docSnap = await docRef.get();

      let answers = docSnap.exists ? docSnap.data().answers : {};
      let currentIndex = docSnap.exists ? docSnap.data().currentIndex : 0;
      let email = docSnap.exists ? docSnap.data().email : null;

      // Retry if email is missing
      if (!email) {
        console.warn(`Email not found in initial fetch for callSid: ${callSid}. Retrying...`);
        await new Promise((resolve) => setTimeout(resolve, 300));
        docSnap = await docRef.get();
        email = docSnap.exists ? docSnap.data().email : null;
      }

      console.log(`Webhook triggered. CallSid: ${callSid}, Email: ${email}, Speech: ${speechResult}`);

      // Save answer from previous question
      if (speechResult) {
        const questionKey = `q${currentIndex}`;
        const label = fieldLabels[questionKey] || questionKey;
        answers[label] = speechResult;
        currentIndex++;
      }

      if (currentIndex >= questions.length) {
        // All questions answered, save data and send sign-in link
        await docRef.set({ answers, currentIndex }, { merge: true });

        if (email) {
          try {
            const link = await admin.auth().generateSignInWithEmailLink(email, actionCodeSettings);

            await admin.firestore().collection('emailLinks').doc(callSid).set({
              email,
              link,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            console.log(`✅ Sign-in link sent to ${email}`);
          } catch (err) {
            console.error('❌ Error sending sign-in link:', err);
          }
        } else {
          console.warn('⚠️ No email available for sign-in link generation.');
        }

        twiml.say(
          { voice: 'Polly.Joanna', language: 'en-US' },
          'Thank you for your time. We will send you a secure sign-in link by email. Goodbye!'
        );
        twiml.hangup();
      } else {
        // Save updated answers and current index
        await docRef.set({ answers, currentIndex }, { merge: true });

        // Greeting added only once before the first question
if (currentIndex === 0 && !speechResult) {
      twiml.say(
        { voice: 'Polly.Joanna', language: 'en-US' },
        'Hello! Thank you for contacting Voice AI Agent. I will ask you a few questions to assist you better.'
      );
      twiml.pause({ length: 2 }); // 2 seconds pause before next prompt
    }

        // Ask current question
        twiml.say(
          { voice: 'Polly.Joanna', language: 'en-US' },
          questions[currentIndex]
        );

        twiml.gather({
          input: 'speech',
          timeout: 5,
          speechTimeout: 'auto',
          action: '/aiWebhook',
          method: 'POST',
        });
      }

      res.type('text/xml').send(twiml.toString());
    } catch (error) {
      console.error('❌ aiWebhook error:', error);
      const twiml = new twilio.twiml.VoiceResponse();
      twiml.say('Sorry, there was an error processing your request. Goodbye.');
      twiml.hangup();
      res.type('text/xml').send(twiml.toString());
    }
  }
);
