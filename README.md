<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1s4HkYRbhEBGAcoDpJs8jeX-mbfb5xeuy

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

#How to use
This webapp doesn't save any data for example uploaded video, server logs etc.
Frame extraction is executed on Web broweser.

##1.
Upload any video.
<img width="1222" height="692" alt="image" src="https://github.com/user-attachments/assets/b027c234-df55-42a0-bfe0-254ebc90e109" />

##2
Shows start/end frame (0.01frame from the end of the video length)
You can download both frames.
