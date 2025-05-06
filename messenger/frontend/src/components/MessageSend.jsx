import React, { useRef } from 'react';
import { FaPlusCircle, FaFileImage, FaGift, FaPaperPlane } from "react-icons/fa";

const emojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
  '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '😝',
  '😜', '🧐', '🤓', '😎', '😕', '🤑', '🥴', '😱'
];

const MessageSend = ({ inputHendle, newMessage, sendMessage, emojiSend, ImageSend }) => {
  const fileInputRef = useRef(null);

  // Keyboard accessibility for emoji picker
  const handleEmojiKeyDown = (e, emoji) => {
    if (e.key === 'Enter' || e.key === ' ') {
      emojiSend(emoji);
    }
  };

  return (
    <div className='message-send-section'>
      {/* Attachment (future feature placeholder) */}
      <div className='file hover-attachment' tabIndex={0} aria-label="Add attachment">
        <div className='add-attachment'>Add Attachment</div>
        <FaPlusCircle />
      </div>

      {/* Image upload */}
      <div className='file hover-image'>
        <div className='add-image'>Add Image</div>
        <input
          onChange={ImageSend}
          type="file"
          id="pic"
          className='form-control'
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
        />
        <label htmlFor='pic' tabIndex={0} aria-label="Add image">
          <FaFileImage />
        </label>
      </div>

      {/* Gift (future feature placeholder) */}
      <div className='file hover-gift' tabIndex={0} aria-label="Add gift">
        <div className='add-gift'>Add gift</div>
        <FaGift />
      </div>

      {/* Message input */}
      <div className='message-type'>
        <input
          type="text"
          onChange={inputHendle}
          name='message'
          id='message'
          placeholder='Aa'
          className='form-control'
          value={newMessage}
          autoComplete="off"
          aria-label="Type a message"
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        {/* Emoji toggle */}
        <div className='file hover-gift'>
          <label htmlFor='emoji-toggle' tabIndex={0} aria-label="Show emoji picker">❤️</label>
        </div>
      </div>

      {/* Send message button */}
      <button
        type="button"
        onClick={sendMessage}
        className='file send-btn'
        aria-label="Send message"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <FaPaperPlane />
      </button>

      {/* Emoji picker */}
      <input type="checkbox" id='emoji-toggle' style={{ display: 'none' }} />
      <div className='emoji-section'>
        <div className='emoji' role="listbox" aria-label="Emoji picker">
          {emojis.map((e, index) => (
            <span
              key={index}
              tabIndex={0}
              role="option"
              aria-label={`Emoji ${e}`}
              onClick={() => emojiSend(e)}
              onKeyDown={ev => handleEmojiKeyDown(ev, e)}
              style={{ cursor: 'pointer' }}
            >
              {e}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MessageSend;
