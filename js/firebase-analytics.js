import { getApp, getApps, initializeApp } from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js';
import {
  getAnalytics,
  isSupported,
  logEvent
} from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-analytics.js';

const firebaseConfig = {
  apiKey: 'AIzaSyB2gZtJ-xvCB0-R2HPSuLuO9N_c1DLsgDg',
  authDomain: 'fincast3.firebaseapp.com',
  projectId: 'fincast3',
  storageBucket: 'fincast3.firebasestorage.app',
  messagingSenderId: '865069030141',
  appId: '1:865069030141:web:bd55793aa43b01bffc7c94',
  measurementId: 'G-QYM0NFFXGR'
};

export async function connectFirebaseAnalytics(global) {
  if (!(await isSupported())) {
    global.FinCastFirebaseStatus = 'unsupported';
    global.FinCastFirebaseQueue.length = 0;
    return;
  }

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);

  function sendEvent(event) {
    const { event: eventName, ...parameters } = event;
    logEvent(analytics, eventName, parameters);
  }

  global.addEventListener('fincast:event', ({ detail }) => sendEvent(detail));
  global.FinCastFirebaseQueue.splice(0).forEach(sendEvent);
  global.FinCastFirebaseStatus = 'ready';
}
