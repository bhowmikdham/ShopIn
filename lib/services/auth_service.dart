import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:flutter/foundation.dart';

/// Handles Firebase Authentication (Google Sign-In).
class AuthService extends ChangeNotifier {
  final FirebaseAuth _auth;
  final GoogleSignIn _googleSignIn = GoogleSignIn();

  User? _user;
  bool _loading = true;

  AuthService(this._auth) {
    _auth.authStateChanges().listen((user) {
      _user = user;
      _loading = false;
      notifyListeners();
    });
  }

  User? get user => _user;
  bool get isAuthenticated => _user != null;
  bool get loading => _loading;
  String? get uid => _user?.uid;
  String? get displayName => _user?.displayName;
  String? get email => _user?.email;
  String? get photoUrl => _user?.photoURL;

  /// Sign in with Google.
  Future<User?> signInWithGoogle() async {
    try {
      if (kIsWeb) {
        // Web: use popup
        final provider = GoogleAuthProvider();
        final result = await _auth.signInWithPopup(provider);
        return result.user;
      } else {
        // Mobile: native Google Sign-In flow
        final googleUser = await _googleSignIn.signIn();
        if (googleUser == null) return null;
        final googleAuth = await googleUser.authentication;
        final credential = GoogleAuthProvider.credential(
          accessToken: googleAuth.accessToken,
          idToken: googleAuth.idToken,
        );
        final result = await _auth.signInWithCredential(credential);
        return result.user;
      }
    } catch (e) {
      debugPrint('[AuthService] Google sign-in failed: $e');
      return null;
    }
  }

  /// Sign out.
  Future<void> signOut() async {
    await _googleSignIn.signOut();
    await _auth.signOut();
  }

  /// Get current ID token for API calls.
  Future<String?> getIdToken() async {
    return await _user?.getIdToken();
  }
}
