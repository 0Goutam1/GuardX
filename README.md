# GuardX
> Real-time AI-powered security sentinel and smart assistant for Discord. Built for the "Flip the Switch" Hackathon.

# About GuardX
GuardX is an intelligent Discord bot designed to protect developer communities in real-time. By leveraging the power of **Google Gemini AI**, GuardX automatically scans chat messages for accidental API key leaks, credentials, and security risks, instantly alerting both the user and server administrators. It also doubles as a smart AI assistant via simple commands.

# Key Features
- Real-Time Security Scanning:- Continuously monitors chat messages to detect exposed API keys, passwords, and sensitive tokens using Google Gemini.

- Automated Audit Logging:- Instantly reports security violations with user tags, channel details, and leaked snippets to a dedicated `#security-logs` admin channel.

- AI Assistant Integration (`!ai`):- Allows members to interact with Gemini directly within Discord for instant answers and coding help.

# Tech Stack
- Runtime:- Node.js
- Discord Framework:- Discord.js (v14)
- AI Engine:- Google GenAI SDK (`@google/genai`)
- Environment Management:- Dotenv


