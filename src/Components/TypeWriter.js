// components/TypeWriter.js
import React, { useState, useEffect, useRef } from 'react';

export const TypeWriter = ({ text, onComplete }) => {
  const [displayText, setDisplayText] = useState('');
  const index = useRef(0);

  useEffect(() => {
    index.current = 0;
    setDisplayText('');
  }, [text]);

  useEffect(() => {
    if (index.current < text.length) {
      const timeoutId = setTimeout(() => {
        setDisplayText(current => current + text[index.current]);
        index.current += 1;
      }, 15);
      return () => clearTimeout(timeoutId);
    } else if (onComplete) {
      onComplete();
    }
  }, [displayText, text, onComplete]);

  return <span>{displayText}</span>;
};