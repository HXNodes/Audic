
module.exports = {
    botName: 'Audic',
    embedColor: '#7289DA',
    supportServer: 'https://discord.gg/76W85cu3Uy',
    botLogo: '',
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
                url: 'lava-v4.ajieblogs.eu.org:80',
                auth: 'https://dsc.gg/ajidevserver',
                secure: true,
                retryAmount: 5,
                retryDelay: 3000
            }
        ]
    }
};
