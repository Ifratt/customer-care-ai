'use client';

import Image from "next/image";
import { useState } from "react";
import { Box, Stack, TextField, Button } from "@mui/material"; // Assuming you're using MUI
import { Trispace } from "next/font/google";

export default function Home() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: 'Hi, I am Headstarter support Agent. How can I assist you today?'
  }]);

  // message state
  const [message, setMessage] = useState('');

  // Helper function to send a message
  const sendMessage = async () => {
    // First, add the user's message to the state
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: '' },
    ]);

    // Clear the input field
    setMessage('');

    // Send the message to the API
    const response = await fetch('/api/chat', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([...messages, { role: "user", content: message }])
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let result = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value, { stream: true });
      result += text;

      setMessages((messages) => {
        let lastMessage = messages[messages.length - 1];
        let otherMessages = messages.slice(0, messages.length - 1);
        return [
          ...otherMessages,
          {
            ...lastMessage,
            content: lastMessage.content + text,
          },
        ];
      });
    }
  };

  return (
    <Box 
      width="100vw" 
      height="100vh" 
      display="flex" 
      justifyContent="center" 
      alignItems="center"
    >
      <Stack
        direction="column"
        width="600px"
        height="700px"
        border="1px solid black"
        p={2}
        spacing={3}
      >
        <Stack 
          direction="column"
          spacing={3}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages.map((message, index) => (
            <Box 
              key={index} 
              display='flex' 
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box 
                bgcolor={message.role === 'assistant' ? 'primary.main' : 'secondary.main'}
                color="white"
                borderRadius={16}
                p={3}
              >
                {message.content}
              </Box>
            </Box>
          ))}
        </Stack>
        <Stack direction="row" spacing={2}>
          <TextField
            label='Message'
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={sendMessage}

          >
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
