import express from "express";
import cors from "cors";
import { RtcTokenBuilder, RtcRole } from "agora-access-token";

const app = express();
app.use(cors());
app.use(express.json());

const APP_ID = "e96bca31177e4039a8fa40e97a1e728a";
const APP_CERTIFICATE = "64cb676ce540478480282b6552e6997d";

// In-memory storage
let meetings = {};

// Create Meeting
app.post("/create", (req, res) => {
    const { code, hostUID } = req.body;

    if (meetings[code]) {
        return res.json({ exists: true });
    }

    meetings[code] = {
        hostUID,
        waiting: [],
        approved: []
    };

    return res.json({ created: true });
});

// Request Join
app.post("/requestJoin", (req, res) => {
    const { code, uid, name } = req.body;

    if (!meetings[code]) {
        return res.json({ error: "Meeting does not exist" });
    }

    meetings[code].waiting.push({ uid, name });
    return res.json({ waiting: true });
});

// Host sees waiting list
app.get("/waiting/:code", (req, res) => {
    const code = req.params.code;
    if (!meetings[code]) return res.json({ error: "Meeting does not exist" });

    return res.json(meetings[code].waiting);
});

// Host approves user
app.post("/approve", (req, res) => {
    const { code, uid } = req.body;

    if (!meetings[code]) return res.json({ error: "Meeting does not exist" });

    meetings[code].waiting = meetings[code].waiting.filter(u => u.uid !== uid);
    meetings[code].approved.push(uid);

    return res.json({ approved: true });
});

// Generate Agora Token
app.get("/token", (req, res) => {
    const { code, uid, role } = req.query;

    if (!meetings[code]) {
        return res.json({ error: "Meeting does not exist" });
    }

    if (!meetings[code].approved.includes(parseInt(uid))) {
        return res.json({ error: "User not approved by host" });
    }

    const expireTime = 3600;
    const now = Math.floor(Date.now() / 1000);
    const expireAt = now + expireTime;

    const agoraRole =
        role === "host" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

    const token = RtcTokenBuilder.buildTokenWithUid(
        APP_ID,
        APP_CERTIFICATE,
        code,
        parseInt(uid),
        agoraRole,
        expireAt
    );

    res.json({ token });
});

// Default
app.get("/", (req, res) => {
    res.send("NexMeet Backend Running ✔");
});

app.listen(3000, () => console.log("Backend running on port 3000"));
