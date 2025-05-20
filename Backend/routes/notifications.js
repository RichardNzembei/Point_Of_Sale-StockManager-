const express = require('express');
const webPush = require('web-push');
const firestore = require('../firebaseConfig');
const router = express.Router();

const vapidKeys = {
  publicKey: 'BPZR6kmFO_ZlPGCbIpCYh88T9rD3ztEspMqwmhBJgPAQefRSp7ZdxZ1Ejnn_ZHwjdTRPeNr_QDCs6V19e8GiWfY',
  privateKey: 'q4ZCACxYdv0UvZdttAbyuQ-b1NIfsq0bi-vuEJAGe6g',
};


webPush.setVapidDetails('mailto:richardsonreuben78@gmail.com', vapidKeys.publicKey, vapidKeys.privateKey);

router.post('/subscribe', async (req, res) => {
  const subscription = req.body;

  try {
    console.log('Received subscription:', subscription);
    const subscriptionRef = firestore.collection('subscriptions');
    await subscriptionRef.add(subscription);
    console.log('New subscription saved:', subscription);
    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (error) {
    console.error('Error saving subscription:', error);
    res.status(500).json({ error: 'Error saving subscription' });
  }
});

router.post('/send', async (req, res) => {
  const notificationPayload = {
    title: req.body.title || 'Notification',
    body: req.body.body || 'This is a test notification.',
  };

  try {
    console.log('Sending notification with payload:', notificationPayload);
    const subscriptionsSnapshot = await firestore.collection('subscriptions').get();
    console.log('Fetched subscriptions:', subscriptionsSnapshot.size);

    if (subscriptionsSnapshot.empty) {
      console.log('No subscriptions found.');
      return res.status(404).json({ message: 'No subscriptions found' });
    }

    const subscriptions = subscriptionsSnapshot.docs.map((doc) => doc.data());
    console.log('Sending notifications to subscriptions:', subscriptions);

    await Promise.all(
      subscriptions.map((subscription) =>
        webPush.sendNotification(subscription, JSON.stringify(notificationPayload))
      )
    );

    res.status(200).json({ message: 'Notifications sent successfully' });
  } catch (error) {
    console.error('Error sending notifications:', error);
    res.status(500).json({ error: 'Failed to send notifications' });
  }
});

module.exports = router;
