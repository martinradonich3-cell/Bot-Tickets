require("dotenv").config();


const {
Client,
GatewayIntentBits,
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
ChannelType,
PermissionsBitField,
SlashCommandBuilder,
REST,
Routes
} = require("discord.js");

const client = new Client({
intents:[
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMembers,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent
]
});


// ================= CONFIG =================

client.login(process.env.TOKEN);

// ROLES
const VERIFIED_ROLE = "1476415074007781519";

// CANALES
const VERIFY_CHANNEL = "1477397627774435491";
const TICKET_CHANNEL = "1477397642710487071";
const WELCOME_CHANNEL = "1477443199697031209";
const CATEGORY_ID = "1476436608051052584";
const INFO_CHANNEL = "1477397672049643722";

// STAFF
const STAFF_ROLE = "1476414964972650546";


// ================= READY =================

client.once("clientReady", async ()=>{

console.log(`✅ ${client.user.tag} ONLINE`);


// ================= VERIFICACION =================

const verifyChannel =
await client.channels.fetch(VERIFY_CHANNEL).catch(()=>null);

if(verifyChannel){

const embed = new EmbedBuilder()
.setColor("#00ff88")
.setTitle("✅ SISTEMA DE VERIFICACIÓN")
.setDescription(`
━━━━━━━━━━━━━━━━━━━━━━

👋 **Bienvenido al servidor**

Para acceder debes verificarte.

🛡 Protección contra:
• Bots
• Spam
• Cuentas falsas

━━━━━━━━━━━━━━━━━━━━━━

✅ Presiona el botón inferior
para obtener acceso completo.

━━━━━━━━━━━━━━━━━━━━━━
`)
.setImage("https://cdn.discordapp.com/attachments/1469835462813417787/1476800393274069144/Diseno_sin_titulo_2.gif")
.setFooter({text:"Sistema automático"})
.setTimestamp();

const button = new ActionRowBuilder()
.addComponents(
new ButtonBuilder()
.setCustomId("verify")
.setLabel("Verificarse")
.setEmoji("✅")
.setStyle(ButtonStyle.Success)
);

verifyChannel.send({
embeds:[embed],
components:[button]
});
}


// ================= TICKETS =================

const ticketChannel =
await client.channels.fetch(TICKET_CHANNEL).catch(()=>null);

if(ticketChannel){

const embed = new EmbedBuilder()
.setColor("#ff00aa")
.setTitle("🎫 CENTRO DE SOPORTE")
.setDescription(`
━━━━━━━━━━━━━━━━━━━━━━

📩 **¿Necesitas ayuda?**

Nuestro staff puede ayudarte con:

🛒 Compras  
💳 Pagos  
🐞 Reportes  
❓ Dudas  

━━━━━━━━━━━━━━━━━━━━━━

⚡ Tiempo estimado:
**Menos de 5 minutos**

━━━━━━━━━━━━━━━━━━━━━━

👇 Presiona el botón para
abrir un ticket privado.

━━━━━━━━━━━━━━━━━━━━━━
`)
.setImage("https://cdn.discordapp.com/attachments/1469835462813417787/1476800393274069144/Diseno_sin_titulo_2.gif")
.setFooter({text:"Soporte Oficial"})
.setTimestamp();

const btn = new ActionRowBuilder()
.addComponents(
new ButtonBuilder()
.setCustomId("ticket")
.setLabel("Abrir Ticket")
.setEmoji("🎫")
.setStyle(ButtonStyle.Primary)
);

ticketChannel.send({
embeds:[embed],
components:[btn]
});
}


// ================= REDES =================

const info =
await client.channels.fetch(INFO_CHANNEL).catch(()=>null);

if(info){

const embed = new EmbedBuilder()
.setColor("#ff00aa")
.setTitle("🌐 NUESTRAS REDES OFICIALES")
.setDescription(`
━━━━━━━━━━━━━━━━━━━━━━

🌎 **Página Web**
🔗 https://BreakerShop.com

📸 **Instagram**
🔗 https://instagram.com/BreakerShop

🎥 **YouTube**
🔗 https://youtube.com/BreakerShop

━━━━━━━━━━━━━━━━━━━━━━
`)
.setImage("https://cdn.discordapp.com/attachments/1469835462813417787/1476800393274069144/Diseno_sin_titulo_2.gif")
.setFooter({text:"Breaker Shop"})
.setTimestamp();

info.send({embeds:[embed]});
}

});


// ================= SLASH COMMANDS =================

const commands = [

new SlashCommandBuilder()
.setName("pago")
.setDescription("Ver métodos de pago"),

new SlashCommandBuilder()
.setName("giverol")
.setDescription("Dar un rol")
.addUserOption(option =>
option.setName("usuario")
.setDescription("Usuario")
.setRequired(true))
.addRoleOption(option =>
option.setName("rol")
.setDescription("Rol")
.setRequired(true))

].map(cmd=>cmd.toJSON());

client.once("clientReady", async ()=>{

const rest = new REST({version:"10"}).setToken(TOKEN);

await rest.put(
Routes.applicationCommands(client.user.id),
{body:commands}
);

console.log("✅ Slash Commands cargados");

});


// ================= INTERACCIONES =================

client.on("interactionCreate", async interaction=>{

// ===== BOTONES =====
if(interaction.isButton()
&& interaction.customId==="verify"){

await interaction.deferReply({flags:64});
await interaction.member.roles.add(VERIFIED_ROLE);

interaction.editReply({
content:"✅ Acceso concedido"
});
}


if(interaction.isButton()
&& interaction.customId==="ticket"){

const existing =
interaction.guild.channels.cache.find(
c=>c.topic===interaction.user.id
);

if(existing)
return interaction.reply({
content:"❌ Ya tienes un ticket abierto",
flags:64
});

const channel =
await interaction.guild.channels.create({
name:`ticket-${interaction.user.username}`,
type:ChannelType.GuildText,
parent:CATEGORY_ID,
topic:interaction.user.id,
permissionOverwrites:[
{
id:interaction.guild.id,
deny:[PermissionsBitField.Flags.ViewChannel]
},
{
id:interaction.user.id,
allow:[
PermissionsBitField.Flags.ViewChannel,
PermissionsBitField.Flags.SendMessages
]
},
{
id:STAFF_ROLE,
allow:[PermissionsBitField.Flags.ViewChannel]
}
]
});

const close =
new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setCustomId("close")
.setLabel("Cerrar Ticket")
.setEmoji("🔒")
.setStyle(ButtonStyle.Danger)
);

channel.send({
content:`🎫 ${interaction.user} soporte llegará pronto.`,
components:[close]
});

interaction.reply({
content:`✅ Ticket creado ${channel}`,
flags:64
});
}


if(interaction.customId==="close"){
interaction.channel.delete().catch(()=>{});
}


// ===== SLASH COMMANDS =====
if(interaction.isChatInputCommand()){

// /pago
if(interaction.commandName==="pago"){

const embed=new EmbedBuilder()
.setTitle("💳 MÉTODOS DE PAGO")
.setDescription(`
━━━━━━━━━━━━━━━━━━━━━━

💰 **Mercado Pago**

Alias:
\`Breaker Shop\`

CBU:
\`1476914719045455902\`

Titular:
\`Breaker Shop\`

━━━━━━━━━━━━━━━━━━━━━━
`)
.setColor("#00ff88");

interaction.reply({embeds:[embed]});
}


// /giverol
if(interaction.commandName==="giverol"){

if(!interaction.member.roles.cache.has(STAFF_ROLE))
return interaction.reply({
content:"❌ No tienes permiso",
flags:64
});

const user =
interaction.options.getMember("usuario");

const role =
interaction.options.getRole("rol");

await user.roles.add(role);

interaction.reply({
content:`✅ Rol ${role.name} dado a ${user.user.tag}`
});
}

}

});

// ================= BIENVENIDA =================

client.on("guildMemberAdd", async member => {

const channel =
await member.guild.channels.fetch(WELCOME_CHANNEL)
.catch(()=>null);

if(!channel) return;

const embed = new EmbedBuilder()
.setColor("#00ff88")
.setTitle("🎉 ¡Nuevo miembro!")
.setDescription(`
━━━━━━━━━━━━━━━━━━━━━━

👋 Bienvenido ${member}

📌 Lee las reglas  
✅ Verifícate para acceder  
🎫 Usa tickets si necesitas ayuda  

━━━━━━━━━━━━━━━━━━━━━━

🔥 Ahora somos **${member.guild.memberCount}** miembros
`)
.setThumbnail(member.user.displayAvatarURL({dynamic:true}))
.setImage("https://cdn.discordapp.com/attachments/1469835462813417787/1476800393274069144/Diseno_sin_titulo_2.gif")
.setFooter({text:`${member.guild.name}`})
.setTimestamp();

channel.send({
content:`🎉 ${member}`,
embeds:[embed]
});

});

client.login(TOKEN);