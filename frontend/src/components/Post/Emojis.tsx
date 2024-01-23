import React, { useState, forwardRef, useImperativeHandle } from 'react';
import './emojis.scss';

interface EmojiMap {
    [key: string]: string;
}

const emojiMap: EmojiMap = {
    "smile": "😄",
    "happy": "😊",
    "grin": "😄",
    "satisfied": "😌",
    "heart-eyes": "😍",
    "extra-happy": "😁",
    "funny": "😜",
    "cool": "😎",
    "reverse-smile": "🙃",
    "expressionless": "😑",
    "disaponted": "😞",
    "drunk": "🥴",
    "sick": "🤢",
    "clown": "🤡",
    "thumbsUp": "👍",
    "thumbsDown": "👎",
    "pray": "🙏",
    "middle-finger": "🖕",
    "heart": "❤️",
    "broken-heart": "💔",
    "fire": "🔥",
    "star": "⭐",
    "rocket": "🚀",
    "sun": "☀️",
    "moon": "🌙",
    "sunny-moon": "🌕",
    "gray-moon": "🌚",
    "cat": "🐱",
    "dog": "🐶",
    "monkey": "🙊",
    "monkey-closed-eyes": "🙈",
    "pizza": "🍕",
    "apple": "🍏",
    "burger": "🍔",
    "wine": "🍷",
    "beer": "🍻",
    "coffee": "☕️",
};

interface EmojisContainerProps {
    insertEmoji: (emoji: string) => void
}

const EmojisContainer: React.ForwardRefRenderFunction<any, EmojisContainerProps> = ({ insertEmoji }, ref) => {
    const [isEmojisContainerVisible, setIsEmojisContainerVisible] = useState(false)

    const selectEmoji = (selectedEmoji: string) => {
        insertEmoji(emojiMap[selectedEmoji])
        // toggleEmojisContainer()
    }

    const toggleEmojisContainer = () => {
        setIsEmojisContainerVisible((prevState) => !prevState)
    }

    useImperativeHandle(ref, () => ({
        toggleEmojisContainer,
    }))

    return (
        <>
            {isEmojisContainerVisible && (
                <div id='emojis-container'>
                    {Object.keys(emojiMap).map((emojiName) => (
                        <button
                            className='emoji-btn'
                            key={emojiName}
                            value={emojiName}
                            onClick={() => selectEmoji(emojiName)}
                        >
                            {emojiMap[emojiName]}
                        </button>
                    ))}
                </div>
            )}
        </>
    );
};

export default forwardRef(EmojisContainer);

