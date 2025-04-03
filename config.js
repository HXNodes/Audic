
module.exports = {
    botName: 'Music Bot',
    embedColor: '#7289DA',
    supportServer: 'https://discord.gg/your-server',
    botLogo: 'https://i.imgur.com/your-logo.png',
    emojis: {
        play: '▶️',
        pause: '⏸️',
        stop: '⏹️',
        skip: '⏭️',
        previous: '⏮️',
        repeat: '🔁',
        loading: '🔄',
        error: '❌',
        success: '✅',
        queue: '📜',
        music: '🎵',
        volume: '🔊',
        time: '⏰',
        user: '👤',
        duration: '⏱️',
        spotify: '💚',
        soundcloud: '🟧',
        youtube: '🔴',
        loopTrack: '🔂',
        loopQueue: '🔁',
        loopOff: '➡️'
    },
    lavalink: {
        nodes: [
            {
                name: 'Main',
                url: 'lavalink.example.com:443',
                auth: 'your-password',
                secure: true
            }
        ]
    }
};
