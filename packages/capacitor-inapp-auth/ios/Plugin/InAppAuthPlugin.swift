import AuthenticationServices
import Capacitor
import Foundation

/**
 * InAppAuth — wraps ASWebAuthenticationSession.
 *
 * SFSafariViewController (what @capacitor/browser opens) silently blocks
 * JavaScript/redirect navigation to custom URL schemes, so the web OAuth flow
 * can never hand control back to the app. ASWebAuthenticationSession is Apple's
 * purpose-built API for this: it presents the system browser, and when the web
 * flow redirects to the registered `callbackScheme` (e.g. `myapp://…`), iOS
 * intercepts it, dismisses the sheet, and returns the URL to the caller.
 */
@objc(InAppAuthPlugin)
public class InAppAuthPlugin: CAPPlugin, CAPBridgedPlugin {
    // Capacitor 6+ registers plugins via CAPBridgedPlugin (the legacy .m
    // CAP_PLUGIN macro alone is NOT enough — the plugin would compile but never
    // register, so isPluginAvailable("InAppAuth") would be false).
    public let identifier = "InAppAuthPlugin"
    public let jsName = "InAppAuth"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "start", returnType: CAPPluginReturnPromise)
    ]

    private var session: ASWebAuthenticationSession?
    private var contextProvider: AuthContextProvider?

    @objc func start(_ call: CAPPluginCall) {
        guard let urlString = call.getString("url"),
              let url = URL(string: urlString),
              let scheme = call.getString("callbackScheme") else {
            call.reject("Missing 'url' or 'callbackScheme'")
            return
        }

        DispatchQueue.main.async {
            let session = ASWebAuthenticationSession(
                url: url,
                callbackURLScheme: scheme
            ) { callbackURL, error in
                if let error = error {
                    let nsError = error as NSError
                    if nsError.domain == ASWebAuthenticationSessionError.errorDomain,
                       nsError.code == ASWebAuthenticationSessionError.canceledLogin.rawValue {
                        call.reject("Sign-in canceled", "CANCELED")
                    } else {
                        call.reject(error.localizedDescription)
                    }
                    return
                }
                call.resolve(["url": callbackURL?.absoluteString ?? ""])
            }

            let provider = AuthContextProvider(anchor: self.bridge?.viewController?.view.window)
            self.contextProvider = provider
            session.presentationContextProvider = provider
            // Keep the user's existing browser cookies so repeat sign-ins are seamless.
            session.prefersEphemeralWebBrowserSession = false
            self.session = session
            session.start()
        }
    }
}

private class AuthContextProvider: NSObject, ASWebAuthenticationPresentationContextProviding {
    let anchor: ASPresentationAnchor?

    init(anchor: ASPresentationAnchor?) {
        self.anchor = anchor
    }

    func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        return anchor ?? ASPresentationAnchor()
    }
}
