/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: isGithubPages ? "/exam-dashboard" : "",
  assetPrefix: isGithubPages ? "/exam-dashboard/" : ""
};

export default nextConfig;
