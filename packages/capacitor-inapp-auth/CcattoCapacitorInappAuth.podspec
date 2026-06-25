require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

# NOTE: s.name MUST equal the pod name Capacitor derives from the npm package
# name (@ccatto/capacitor-inapp-auth -> CcattoCapacitorInappAuth). A casing or
# token mismatch makes `pod install` fail with "podspec doesn't match expected".
Pod::Spec.new do |s|
  s.name = 'CcattoCapacitorInappAuth'
  s.version = package['version']
  s.summary = package['description']
  s.license = package['license']
  s.homepage = package['homepage']
  s.author = 'Chris Catto'
  s.source = { :git => 'https://github.com/ccatto/catto-packages.git', :tag => s.version.to_s }
  s.source_files = 'ios/Plugin/**/*.{swift,h,m}'
  s.ios.deployment_target = '14.0'
  s.dependency 'Capacitor'
  s.swift_version = '5.1'
end
