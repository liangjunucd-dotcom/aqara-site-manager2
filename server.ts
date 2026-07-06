import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Lazy-loaded or optional Gemini client setup
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// REST API endpoint: AI site layout recommendation generator
app.post('/api/builder/ai-suggest', async (req, res) => {
  try {
    const { prompt, floorPlanName, rooms } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const availableRooms = rooms || ['Living Room', 'Master Bedroom', 'Kitchen', 'Corridor', 'Balcony'];
    const floorName = floorPlanName || 'Modern 2-Bedroom Villa';

    if (ai) {
      const promptString = `You are Aqara AI Studio Expert. Design a premium smart home layout for the floor plan "${floorName}" with rooms: [${availableRooms.join(', ')}].
The user wants: "${prompt}".
Select suitable devices from these Aqara products:
1. Aqara Hub M3 (HM3-G01) - Must have exactly 1 central Hub.
2. Camera Hub G3 (CH-H03) - Elegant pan-and-tilt security camera.
3. Smart Lock U200 (SL-U200) - For entryways/doors.
4. Presence Sensor FP2 (PS-FP2) - Advanced millimeter-wave radar presence tracker.
5. Door & Window Sensor T1 (DW-T1) - Contact sensor for doors/windows.
6. Smart Wall Switch H1 (WS-H1) - Light controller.
7. Curtain Driver E1 (CD-E1) - Automated curtain/blind motor.
8. Ceiling Light T1 (CL-T1) - Smart light.

Recommend 4 to 8 devices, distributing them logically with coordinates (x, y) where each coordinate is between 5 and 95 (as a percentage on the layout canvas).
Make sure to place:
- Smart Lock U200 and Door & Window Sensor on entryways.
- Hub M3 centrally (e.g. Living Room or Corridor) around x: 50, y: 50.
- Camera G3 facing doors or in open areas.
- FP2 and Switch H1 in active zones.

Return a JSON object conforming exactly to this structure:
{
  "recommendations": [
    {
      "type": "hub" | "camera" | "lock" | "sensor" | "switch" | "curtain" | "light",
      "name": "Readable Name (e.g. Entryway Lock)",
      "model": "Aqara Hub M3",
      "room": "Matching Room Name",
      "x": 45,
      "y": 60,
      "reason": "Why this specific device goes here"
    }
  ],
  "analysis": "A brief elegant structural analysis summarizing mesh strength, automation scripts, and general smart home design advice (1-2 short paragraphs)."
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: promptString,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    name: { type: Type.STRING },
                    model: { type: Type.STRING },
                    room: { type: Type.STRING },
                    x: { type: Type.INTEGER },
                    y: { type: Type.INTEGER },
                    reason: { type: Type.STRING },
                  },
                  required: ['type', 'name', 'model', 'room', 'x', 'y', 'reason'],
                },
              },
              analysis: { type: Type.STRING },
            },
            required: ['recommendations', 'analysis'],
          },
        },
      });

      const responseText = response.text;
      if (responseText) {
        return res.json(JSON.parse(responseText.trim()));
      }
    }

    // Fallback: Elegant preset mock-AI generated layouts if Gemini Key isn't loaded/configured yet
    console.log('Using local fallback layout generator...');
    const lowerPrompt = prompt.toLowerCase();
    let recommendations = [];
    let analysis = '';

    if (lowerPrompt.includes('security') || lowerPrompt.includes('safe') || lowerPrompt.includes('lock')) {
      recommendations = [
        { type: 'hub', name: 'Central Hub M3', model: 'Aqara Hub M3', room: availableRooms[0] || 'Living Room', x: 50, y: 50, reason: 'Acts as local security siren and Matter/Zigbee coordinator for all sensors.' },
        { type: 'lock', name: 'Front Entrance Smart Lock', model: 'Smart Lock U200', room: availableRooms[4] || 'Corridor', x: 15, y: 25, reason: 'Provides secure Apple Home Key authentication at the main portal.' },
        { type: 'camera', name: 'Foyer AI Camera G3', model: 'Camera Hub G3', room: availableRooms[4] || 'Corridor', x: 25, y: 35, reason: '2K camera monitors foyer with gesture control and facial recognition warnings.' },
        { type: 'sensor', name: 'Entrance Contact Sensor', model: 'Door & Window Sensor T1', room: availableRooms[4] || 'Corridor', x: 10, y: 20, reason: 'Instant open/closed alerts that trigger the camera recording and alarm.' },
        { type: 'sensor', name: 'Living Room Presence Radar FP2', model: 'Presence Sensor FP2', room: availableRooms[0] || 'Living Room', x: 75, y: 65, reason: 'Millimeter-wave radar monitors unauthorized movement even if static.' }
      ];
      analysis = 'Security-first topography designed. Includes full entrance guarding with biometric locking and facial tracking, paired with millimeter-wave space monitoring for robust local alert triggers.';
    } else if (lowerPrompt.includes('eco') || lowerPrompt.includes('energy') || lowerPrompt.includes('green') || lowerPrompt.includes('power')) {
      recommendations = [
        { type: 'hub', name: 'Central Hub M3', model: 'Aqara Hub M3', room: availableRooms[0] || 'Living Room', x: 48, y: 45, reason: 'Hosts local automation rules to manage thermostatic offsets and lights offline.' },
        { type: 'sensor', name: 'Smart Climate Sensor', model: 'Temperature & Humidity Sensor T1', room: availableRooms[1] || 'Master Bedroom', x: 80, y: 30, reason: 'Measures continuous thermal logs to offset HVAC duty cycles dynamically.' },
        { type: 'switch', name: 'Living Room Switch H1', model: 'Smart Wall Switch H1', room: availableRooms[0] || 'Living Room', x: 35, y: 60, reason: 'Monitors real-time power draw and schedules adaptive ambient overrides.' },
        { type: 'curtain', name: 'Master Bed Thermal Curtains', model: 'Curtain Driver E1', room: availableRooms[1] || 'Master Bedroom', x: 85, y: 15, reason: 'Closes automatically during peak solar heat to lower cooling costs.' },
        { type: 'light', name: 'High Efficiency LED Ceiling', model: 'Ceiling Light T1', room: availableRooms[0] || 'Living Room', x: 55, y: 75, reason: 'Dimmable smart lighting configured for circadian energy-saving schedules.' }
      ];
      analysis = 'Energy efficiency topology created. This layout leverages thermal sensing to coordinate motorized shading and adaptive circadian dimming, yielding up to a 15% reduction in climate power loads.';
    } else {
      // General balanced setup
      recommendations = [
        { type: 'hub', name: 'Central Hub M3', model: 'Aqara Hub M3', room: availableRooms[0] || 'Living Room', x: 50, y: 48, reason: 'Matter border router establishing Thread networks and Zigbee controller hubs.' },
        { type: 'camera', name: 'Living Room Cam G3', model: 'Camera Hub G3', room: availableRooms[0] || 'Living Room', x: 20, y: 25, reason: 'Keeps visual watch on open social areas and serves as an auxiliary Zigbee extender.' },
        { type: 'sensor', name: 'Living Room Presence Radar FP2', model: 'Presence Sensor FP2', room: availableRooms[0] || 'Living Room', x: 80, y: 70, reason: 'Tracks accurate room occupancy zones to trigger localized heating and lighting.' },
        { type: 'switch', name: 'Bedroom Switch H1', model: 'Smart Wall Switch H1', room: availableRooms[1] || 'Master Bedroom', x: 75, y: 35, reason: 'Enables quick manual scene switching and primary room lighting control.' },
        { type: 'lock', name: 'Main Entrance Lock U200', model: 'Smart Lock U200', room: availableRooms[4] || 'Corridor', x: 12, y: 30, reason: 'Keyless biometric front lock ensuring local offline safety.' }
      ];
      analysis = 'Standard balanced home layout compiled. Offers a high-density Zigbee mesh and multi-protocol Matter control. Ideal for general comfort, safety, and flexible local logic scripts.';
    }

    res.json({ recommendations, analysis });
  } catch (error: any) {
    console.error('Error in ai-suggest endpoint:', error);
    res.status(500).json({ error: error.message || 'Server layout generation failed' });
  }
});

// Start server and handle Vite development vs production asset delivery
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Aqara Site Manager backend running at http://localhost:${PORT}`);
  });
}

startServer();
