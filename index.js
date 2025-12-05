import express from "express";
import cors from "cors";
import pkg from "agora-access-token";
const { RtcTokenBuilder, RtcRole } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

// Agora Keys
const APP_ID = "e96bca31177e4039a8fa40e97a1e728a";
const APP_CERT = "64cb676ce540478480282b6552e6997d";

app.get("/", (req, res) => {
  res.json({ status: "NexMeet backend is running" });
});

app.get("/token", (req, res) => {
  const channel = req.query.channel;

  if (!channel) {
    return res.status(400).json({ error: "channel parameter required" });
  }

  const uid = 0; 
  const role = RtcRole.PUBLISHER;
  const expire = Math.floor(Date.now() / 1000) + 3600;

  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERT,
    channel,
    uid,
    role,
    expire
  );

  res.json({ token });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Backend running on port " + PORT));
