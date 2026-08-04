// swift-tools-version: 5.9
import PackageDescription

// Capacitor 6+ projects that use Swift Package Manager (a `CapApp-SPM/` dir
// instead of a Podfile) discover plugins by looking for THIS file at the plugin
// package root. Without it, `cap sync` silently drops the plugin from the
// generated CapApp-SPM/Package.swift — the Swift compiles nowhere, the plugin
// never registers, and `isPluginAvailable("InAppAuth")` is false at runtime.
//
// The library product name MUST equal the name Capacitor derives from the npm
// package name (@ccatto/capacitor-inapp-auth -> CcattoCapacitorInappAuth); the
// CLI writes `.product(name: "CcattoCapacitorInappAuth", package:
// "CcattoCapacitorInappAuth")` into CapApp-SPM, so a mismatch fails resolution.
// The .podspec (for CocoaPods-based apps like rleaguez) is kept alongside this
// so the plugin works under BOTH package managers.
let package = Package(
    name: "CcattoCapacitorInappAuth",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "CcattoCapacitorInappAuth",
            targets: ["InAppAuthPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0")
    ],
    targets: [
        .target(
            name: "InAppAuthPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "ios/Plugin")
    ]
)
