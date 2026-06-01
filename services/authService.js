import { 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink, 
  signInWithEmailLink, 
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { auth } from './firebaseClient';

export const authService = {
  /**
   * Sends a magic link to the user's email.
   */
  async sendMagicLink(email) {
    const actionCodeSettings = {
      // URL must be whitelisted in Firebase Console -> Auth -> Settings -> Authorized domains
      url: typeof window !== 'undefined' ? `${window.location.origin}/account` : 'https://nexa-solve-store-9901.web.app/account',
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      // Save the email locally so we don't need to ask for it again after they click the link
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('emailForSignIn', email);
      }
      return { success: true };
    } catch (error) {
      console.error("Error sending email link:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Completes the sign-in process if the current URL is a sign-in link.
   */
  async completeSignIn(url) {
    if (isSignInWithEmailLink(auth, url)) {
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        return { success: false, requireEmail: true };
      }

      try {
        const result = await signInWithEmailLink(auth, email, url);
        window.localStorage.removeItem('emailForSignIn');
        return { success: true, user: result.user };
      } catch (error) {
        console.error("Error signing in with email link:", error);
        return { success: false, error: error.message };
      }
    }
    return { success: false, error: 'Not a valid sign-in link.' };
  },

  /**
   * Initiates Google Sign-In using popup (with fallback to redirect for mobile)
   */
  async signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      // Prefer popup for desktop/modern browsers
      const result = await signInWithPopup(auth, provider);
      return { success: true, user: result.user };
    } catch (error) {
      console.error("Google Sign-In Popup Error:", error);
      
      // If popup is blocked or fails due to mobile browser limitations, fallback to redirect
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
         return { success: false, error: 'Popup was blocked or closed. Please allow popups or try again.' };
      }
      
      // Attempt redirect as a fallback for other generic auth/web-storage issues
      try {
        await signInWithRedirect(auth, provider);
        return { success: true, pendingRedirect: true };
      } catch (redirectError) {
        return { success: false, error: redirectError.message };
      }
    }
  },

  /**
   * Checks for Google Sign-In redirect results when the page loads
   */
  async checkRedirectResult() {
    try {
      const result = await getRedirectResult(auth);
      if (result && result.user) {
        return { success: true, user: result.user };
      }
      return { success: false };
    } catch (error) {
      console.error("Error fetching redirect result:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Subscribes to authentication state changes.
   */
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  },

  /**
   * Signs the user out.
   */
  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error("Error logging out:", error);
      return { success: false, error: error.message };
    }
  }
};
