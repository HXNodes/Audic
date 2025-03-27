const { createEmbed, errorEmbed, successEmbed } = require('../utils/embeds');
const config = require('../config');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        // Handle slash commands
        if (interaction.isCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(`Error executing command ${interaction.commandName}:`, error);
                
                const errorResponse = {
                    embeds: [errorEmbed('There was an error while executing this command!')],
                    ephemeral: true
                };
                
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(errorResponse);
                } else {
                    await interaction.reply(errorResponse);
                }
            }
        }
        
        // Handle button interactions
        if (interaction.isButton()) {
            const { client, guild } = interaction;
            const player = client.kazagumo.players.get(guild.id);
            
            if (!player) {
                return interaction.reply({ 
                    embeds: [errorEmbed('No active player found!')], 
                    ephemeral: true 
                });
            }
            
            // Check if user is in the same voice channel
            const member = interaction.member;
            if (!member.voice.channel || member.voice.channel.id !== player.voiceId) {
                return interaction.reply({ 
                    embeds: [errorEmbed('You must be in the same voice channel to use these controls!')], 
                    ephemeral: true 
                });
            }
            
            try {
                switch (interaction.customId) {
                    case 'pause_resume':
                        if (player.paused) {
                            player.pause(false);
                            await interaction.reply({ 
                                embeds: [successEmbed(`${config.emojis.play} Resumed playback`)],
                                ephemeral: true 
                            });
                        } else {
                            player.pause(true);
                            await interaction.reply({ 
                                embeds: [successEmbed(`${config.emojis.pause} Paused playback`)],
                                ephemeral: true 
                            });
                        }
                        break;
                        
                    case 'skip':
                        player.skip();
                        await interaction.reply({ 
                            embeds: [successEmbed(`${config.emojis.skip} Skipped to the next track`)],
                            ephemeral: true 
                        });
                        break;
                        
                    case 'stop':
                        player.destroy();
                        await interaction.reply({ 
                            embeds: [successEmbed(`${config.emojis.stop} Stopped playback and left the voice channel`)],
                            ephemeral: true 
                        });
                        break;
                        
                    case 'queue':
                        try {
                            // We need to properly handle the queue button by creating an interaction
                            // that the queue command can understand and use
                            
                            // First, get the queue command
                            const queueCommand = client.commands.get('queue');
                            if (!queueCommand) {
                                return await interaction.reply({ 
                                    embeds: [errorEmbed('Queue command not found!')],
                                    ephemeral: true 
                                });
                            }
                            
                            // Create a modified interaction that mimics a slash command interaction
                            // with the proper structure that the queue command expects
                            const modifiedInteraction = {
                                ...interaction,
                                options: {
                                    getInteger: (name) => name === 'page' ? 1 : null,
                                },
                                commandName: 'queue',
                                client: client,
                                reply: interaction.reply.bind(interaction),
                                followUp: interaction.followUp.bind(interaction),
                                editReply: interaction.editReply.bind(interaction)
                            };
                            
                            // Execute the queue command with our modified interaction
                            await queueCommand.execute(modifiedInteraction);
                        } catch (error) {
                            console.error('Error handling queue button:', error);
                            await interaction.reply({ 
                                embeds: [errorEmbed(`Failed to show queue: ${error.message}`)],
                                ephemeral: true 
                            });
                        }
                        break;
                        
                    case 'loop':
                        // Handle loop mode cycling: none > track > queue > none
                        // Kazagumo uses 'none', 'track', 'queue' as valid loop modes
                        const loopModes = ['none', 'track', 'queue'];
                        const currentMode = player.loop || 'none';
                        const currentIndex = loopModes.indexOf(currentMode);
                        const nextIndex = (currentIndex + 1) % loopModes.length;
                        const nextMode = loopModes[nextIndex];
                        
                        player.setLoop(nextMode);
                        
                        const modeName = nextMode === 'none' ? 'Off' : 
                                         nextMode === 'track' ? 'Current Track' : 
                                         'Queue';
                        
                        await interaction.reply({ 
                            embeds: [successEmbed(`Loop mode set to: ${modeName}`)],
                            ephemeral: true 
                        });
                        break;
                        
                    case 'lyrics':
                        try {
                            const track = player.queue.current;
                            if (!track) {
                                return interaction.reply({ 
                                    embeds: [errorEmbed('No track currently playing!')],
                                    ephemeral: true 
                                });
                            }
                            
                            // Get artist and title
                            const title = track.title;
                            // Extract artist from title (format is usually "Artist - Title")
                            let artist = title.includes('-') ? title.split('-')[0].trim() : '';
                            
                            // Create lyrics embed
                            const lyricsEmbed = createEmbed({
                                title: `📃 Lyrics for ${track.title}`,
                                description: `Searching for lyrics using [LrcLib.net](https://lrclib.net/search?q=${encodeURIComponent(title)})...\n\nLyrics will open in your browser.`,
                                thumbnail: track.thumbnail,
                                fields: [
                                    {
                                        name: 'Track',
                                        value: track.title,
                                        inline: true
                                    },
                                    {
                                        name: 'Artist',
                                        value: artist || 'Unknown',
                                        inline: true
                                    }
                                ],
                                footer: 'Powered by LrcLib.net',
                                timestamp: true
                            });
                            
                            await interaction.reply({ 
                                embeds: [lyricsEmbed],
                                components: [
                                    new ActionRowBuilder()
                                        .addComponents(
                                            new ButtonBuilder()
                                                .setLabel('Search Lyrics')
                                                .setStyle(ButtonStyle.Link)
                                                .setURL(`https://lrclib.net/search?q=${encodeURIComponent(title)}`)
                                        )
                                ],
                                ephemeral: false
                            });
                        } catch (error) {
                            console.error('Error fetching lyrics:', error);
                            await interaction.reply({ 
                                embeds: [errorEmbed('Error fetching lyrics. Please try again later.')],
                                ephemeral: true 
                            });
                        }
                        break;
                        
                    default:
                        await interaction.reply({ 
                            embeds: [errorEmbed('Unknown button interaction')],
                            ephemeral: true 
                        });
                }
            } catch (error) {
                console.error('Error handling button interaction:', error);
                await interaction.reply({ 
                    embeds: [errorEmbed(`An error occurred: ${error.message || 'Unknown error'}`)],
                    ephemeral: true 
                });
            }
        }
    },
};
