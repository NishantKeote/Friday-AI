import React, { useEffect, useRef, useState } from "react";
import img from "./ai-human.avif";

const App = () => {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [information, setInformation] = useState("");
  const [voices, setVoices] = useState([]);

  const recognitionRef = useRef(null);
  const manuallyStopped = useRef(false);
  const isSpeakingRef = useRef(false);

  // ---------------- LOAD VOICES ----------------
  useEffect(() => {
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      setVoices(allVoices);
    };

    loadVoices();

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // ---------------- SPEECH RECOGNITION ----------------
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      console.log("Listening...");
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      if (isSpeakingRef.current) return;
      const spokenText =
        event.results[event.results.length - 1][0].transcript
          .trim()
          .toLowerCase();

      // Ignore empty speech
      if (!spokenText || spokenText.length < 2) {
        return;
      }

      console.log("User:", spokenText);

      setTranscript(spokenText);

      handleVoiceCommand(spokenText);

      // Stop after one command
      manuallyStopped.current = true;
      recognition.stop();
      setIsListening(false);

    };

    recognition.onerror = (event) => {
      console.log("Speech Error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log("Stopped Listening");
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);

  // ---------------- START LISTENING ----------------
  const startListening = () => {
    if (!recognitionRef.current || isListening || isSpeakingRef.current) return;

    window.speechSynthesis.cancel();

    manuallyStopped.current = false;
    setTranscript("");
    recognitionRef.current.start();
  };

  // ---------------- STOP LISTENING ----------------
  const stopListening = () => {
    if (!recognitionRef.current) return;

    manuallyStopped.current = true;
    recognitionRef.current.stop();
    setIsListening(false);
  };

  // ---------------- TEXT TO SPEECH ----------------
  // ---------------- TEXT TO SPEECH ----------------
  const speakText = (text) => {
    if (!text) return;

    window.speechSynthesis.cancel();

    isSpeakingRef.current = true;

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    if (voices.length > 0) {
      const femaleVoice = voices.find(
        (voice) =>
          voice.name.toLowerCase().includes("female") ||
          voice.name.toLowerCase().includes("zira") ||
          voice.name.toLowerCase().includes("samantha")
      );

      utterance.voice = femaleVoice || voices[0];
    }

    utterance.onend = () => {
      isSpeakingRef.current = false;
    };

    window.speechSynthesis.speak(utterance);

    setInformation(text);
  };
  // ---------------- HANDLE COMMAND ----------------
  const handleVoiceCommand = (command) => {
    console.log(JSON.stringify(command));
    command = command
      .toLowerCase()
      .replace(/[.,!?]/g, "")
      .trim();

    console.log(command);

    const websites = {
      youtube: "https://www.youtube.com",
      google: "https://www.google.com",
      github: "https://github.com",
      linkedin: "https://www.linkedin.com",
      instagram: "https://www.instagram.com",
      facebook: "https://www.facebook.com",
      gmail: "https://mail.google.com",
      chatgpt: "https://chatgpt.com",
      leetcode: "https://leetcode.com",
      gfg: "https://www.geeksforgeeks.org",
      geeksforgeeks: "https://www.geeksforgeeks.org",
      codeforces: "https://codeforces.com",
      hackerrank: "https://www.hackerrank.com",
      amazon: "https://www.amazon.in",
      flipkart: "https://www.flipkart.com",
      netflix: "https://www.netflix.com",
      spotify: "https://open.spotify.com",
      whatsapp: "https://web.whatsapp.com",
      reddit: "https://www.reddit.com",
      wikipedia: "https://www.wikipedia.org",
      twitter: "https://twitter.com",
      x: "https://twitter.com"
    };

    // ---------------- OPEN WEBSITE ----------------

    const openPrefixes = [
      "open ",
      "please open ",
      "can you open ",
      "launch ",
      "go to ",
    ];

    for (const prefix of openPrefixes) {
      if (command.startsWith(prefix)) {
        const site = command.replace(prefix, "").trim();

        if (websites[site]) {
          speakText(`Opening ${site}`);
          window.open(websites[site], "_blank");
          return;
        }
      }
    }

    // ---------------- GOOGLE SEARCH ----------------
    if (command.startsWith("search google for ")) {
      const query = command.replace("search google for ", "").trim();

      if (!query) return;

      speakText(`Searching Google for ${query}`);

      window.open(
        `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        "_blank"
      );

      return;
    }

    // ---------------- YOUTUBE SEARCH ----------------
    if (command.startsWith("search youtube for ")) {
      const query = command.replace("search youtube for ", "").trim();

      if (!query) return;

      speakText(`Searching YouTube for ${query}`);

      window.open(
        `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
        "_blank"
      );

      return;
    }

    // ---------------- PLAY VIDEO ----------------

    if (command.startsWith("play ")) {
      const song = command
        .replace("play", "")
        .replace("on youtube", "")
        .trim();

      if (!song) {
        speakText("Please tell me what you want to play.");
        return;
      }

      speakText(`Playing ${song} on YouTube`);

      window.open(
        `https://www.youtube.com/results?search_query=${encodeURIComponent(song)}`,
        "_blank"
      );
      return;
    }

    // ---------------- TIME ----------------

    if (
      command.includes("what time") ||
      command.includes("current time") ||
      command === "time"
    ) {
      const time = new Date().toLocaleTimeString();

      speakText(`The time is ${time}`);
      setInformation(time);
      return;
    }

    // ---------------- DATE ----------------
    if (
      command.includes("today's date") ||
      command.includes("what is today's date") ||
      command === "date"
    ) {
      const date = new Date().toDateString();

      speakText(`Today's date is ${date}`);
      setInformation(date);
      return;
    }

    // ---------------- NAME ----------------

    if (
      command.includes("your name") ||
      command.includes("who are you")
    ) {
      const msg = "I am Friday, your AI voice assistant.";

      speakText(msg);
      setInformation(msg);
      return;
    }

    // ---------------- HELLO ----------------

    console.log("Reached greeting check");

    if (
      command.includes("hello") ||
      command.includes("hi") ||
      command.includes("hey")
    ) {
      console.log("Greeting matched");

      const msg = "Hello Sir, How can I help you?";

      speakText(msg);
      setInformation(msg);
      return;
    }


    if (command.startsWith("who is ")) {
      const person = command.replace("who is ", "").trim();

      fetchPersonData(person).then((data) => {
        if (data) {
          speakText(data.extract);
          setInformation(data.extract);
        } else {
          const msg = `Sorry, I couldn't find information about ${person}.`;
          speakText(msg);
          setInformation(msg);
        }
      });

      return;
    }
    // ---------------- DEFAULT ----------------

    const msg = "Sorry, I didn't understand that command.";

    speakText(msg);
    setInformation(msg);
    return;
  };
  // ---------------- WIKIPEDIA ----------------
  const fetchPersonData = async (person) => {
    try {
      const response = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
          person
        )}`
      );

      const data = await response.json();

      if (data?.title && data?.extract) {
        return {
          name: data.title,
          extract: data.extract.split(".")[0],
        };
      }

      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  // ---------------- GOOGLE SEARCH ----------------
  const performGoogleSearch = (query) => {
    window.open(
      `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      "_blank"
    );
  };

  // ---------------- UI ----------------
  return (
    <div>
      <div className="voice-assistant">
        <img
          src={img}
          alt="AI"
          className={`ai-image ${isListening ? "listening" : ""}`}
        />

        <h2>Voice Assistant (Friday)</h2>

        <button
          className={`btn ${isListening ? "listening" : ""}`}
          onClick={isListening ? stopListening : startListening}
        >
          <i
            className={`fas ${isListening ? "fa-stop-circle" : "fa-microphone"
              }`}
          ></i>

          {isListening ? "Stop Listening" : "Start Listening"}
        </button>

        <p className="transcript">{transcript}</p>

        <p className="information">{information}</p>
      </div>
    </div>
  );
};

export default App; 