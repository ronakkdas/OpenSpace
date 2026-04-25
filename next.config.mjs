/** @type {import('next').NextConfig} */
const nextConfig = {
  // react-leaflet 4 doesn't survive strict mode's double-effect in dev:
  // the first MapContainer init binds _leaflet_id, the second throws
  // "Map container is already initialized." Strict mode only changes dev
  // behavior — production builds are unaffected.
  reactStrictMode: false,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  }
};

export default nextConfig;

