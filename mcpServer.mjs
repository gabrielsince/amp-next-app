import express from "express";
import { z } from "zod";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// 请替换为你的高德地图 API 密钥
const AMAP_MAPS_API_KEY = "1282992b6d952d45de8d05ac5af4353c"; // 请替换为实际的 API 密钥

export const tools = {
  "test": {
    schema: z.object({ query: z.string() }),
    handler: async ({ query }) => {
      try {
        const mockResult = {
          address: query,
          location: { lat: 39.9042, lng: 116.4074 },
        };
        return {
          content: [{ type: "text", text: JSON.stringify(mockResult) }],
        };
      } catch (error) {
        throw new Error(`Tool error: ${error.message}`);
      }
    },
  },
  "amap-geocode": {
    schema: z.object({ query: z.string() }),
    handler: async ({ query }) => {
      try {
        const response = await fetch(
          `https://restapi.amap.com/v3/geocode/geo?key=${AMAP_MAPS_API_KEY}&address=${query}`
        );
        const data = await response.json();
        return {
          content: [{ type: "text", text: JSON.stringify(data) }],
        };
      } catch (error) {
        throw new Error(`Tool error: ${error.message}`);
      }
    },
  },
  "maps_regeocode": {
    schema: z.object({
      location: z.string(),
    }),
    handler: async ({ location }) => {
      try {
        const url = new URL("https://restapi.amap.com/v3/geocode/regeo");
        url.searchParams.append("location", location);
        url.searchParams.append("key", AMAP_MAPS_API_KEY);
        url.searchParams.append("source", "ts_mcp");
        const response = await fetch(url.toString());
        const data = await response.json();
        if (data.status !== "1") {
          throw new Error(`RGeocoding failed: ${data.info || data.infocode}`);
        }
        const result = {
          province: data.regeocode.addressComponent.province,
          city: data.regeocode.addressComponent.city,
          district: data.regeocode.addressComponent.district,
        };
        return {
          content: [{ type: "text", text: JSON.stringify(result) }],
        };
      } catch (error) {
        throw new Error(`Tool error: ${error.message}`);
      }
    },
  },
  "maps_geo": {
    schema: z.object({
      address: z.string(),
      city: z.string().optional(),
    }),
    handler: async ({ address, city }) => {
      try {
        const url = new URL("https://restapi.amap.com/v3/geocode/geo");
        url.searchParams.append("key", AMAP_MAPS_API_KEY);
        url.searchParams.append("address", address);
        if (city) url.searchParams.append("city", city);
        url.searchParams.append("source", "ts_mcp");
        const response = await fetch(url.toString());
        const data = await response.json();
        if (data.status !== "1") {
          throw new Error(`Geocoding failed: ${data.info || data.infocode}`);
        }
        const geocodes = data.geocodes || [];
        const res = geocodes.map((geo) => ({
          country: geo.country,
          province: geo.province,
          city: geo.city,
          citycode: geo.citycode,
          district: geo.district,
          street: geo.street,
          number: geo.number,
          adcode: geo.adcode,
          location: geo.location,
          level: geo.level,
        }));
        return {
          content: [{ type: "text", text: JSON.stringify({ return: res }) }],
        };
      } catch (error) {
        throw new Error(`Tool error: ${error.message}`);
      }
    },
  },
  "maps_ip_location": {
    schema: z.object({
      ip: z.string(),
    }),
    handler: async ({ ip }) => {
      try {
        const url = new URL("https://restapi.amap.com/v3/ip");
        url.searchParams.append("ip", ip);
        url.searchParams.append("key", AMAP_MAPS_API_KEY);
        url.searchParams.append("source", "ts_mcp");
        const response = await fetch(url.toString());
        const data = await response.json();
        if (data.status !== "1") {
          throw new Error(`IP Location failed: ${data.info || data.infocode}`);
        }
        const result = {
          province: data.province,
          city: data.city,
          adcode: data.adcode,
          rectangle: data.rectangle,
        };
        return {
          content: [{ type: "text", text: JSON.stringify(result) }],
        };
      } catch (error) {
        throw new Error(`Tool error: ${error.message}`);
      }
    },
  },
  "maps_weather": {
    schema: z.object({
      city: z.string(),
    }),
    handler: async ({ city }) => {
      try {
        const url = new URL("https://restapi.amap.com/v3/weather/weatherInfo");
        url.searchParams.append("city", city);
        url.searchParams.append("key", AMAP_MAPS_API_KEY);
        url.searchParams.append("source", "ts_mcp");
        url.searchParams.append("extensions", "all");
        const response = await fetch(url.toString());
        const data = await response.json();
        if (data.status !== "1") {
          throw new Error(`Get weather failed: ${data.info || data.infocode}`);
        }
        const result = {
          city: data.forecasts[0].city,
          forecasts: data.forecasts[0].casts,
        };
        return {
          content: [{ type: "text", text: JSON.stringify(result) }],
        };
      } catch (error) {
        throw new Error(`Tool error: ${error.message}`);
      }
    },
  },
  "maps_search_detail": {
    schema: z.object({
      id: z.string(),
    }),
    handler: async ({ id }) => {
      try {
        const url = new URL("https://restapi.amap.com/v3/place/detail");
        url.searchParams.append("id", id);
        url.searchParams.append("key", AMAP_MAPS_API_KEY);
        url.searchParams.append("source", "ts_mcp");
        const response = await fetch(url.toString());
        const data = await response.json();
        if (data.status !== "1") {
          throw new Error(`Get poi detail failed: ${data.info || data.infocode}`);
        }
        const poi = data.pois[0];
        const result = {
          id: poi.id,
          name: poi.name,
          location: poi.location,
          address: poi.address,
          business_area: poi.business_area,
          city: poi.cityname,
          type: poi.type,
          alias: poi.alias,
          ...poi.biz_ext,
        };
        return {
          content: [{ type: "text", text: JSON.stringify(result) }],
        };
      } catch (error) {
        throw new Error(`Tool error: ${error.message}`);
      }
    },
  },
  "maps_bicycling": {
    schema: z.object({
      origin: z.string(),
      destination: z.string(),
    }),
    handler: async ({ origin, destination }) => {
      try {
        const url = new URL("https://restapi.amap.com/v4/direction/bicycling");
        url.searchParams.append("key", AMAP_MAPS_API_KEY);
        url.searchParams.append("origin", origin);
        url.searchParams.append("destination", destination);
        url.searchParams.append("source", "ts_mcp");
        const response = await fetch(url.toString());
        const data = await response.json();
        if (data.errcode !== 0) {
          throw new Error(`Direction bicycling failed: ${data.info || data.infocode}`);
        }
        const result = {
          data: {
            origin: data.data.origin,
            destination: data.data.destination,
            paths: data.data.paths.map((path) => ({
              distance: path.distance,
              duration: path.duration,
              steps: path.steps.map((step) => ({
                instruction: step.instruction,
                road: step.road,
                distance: step.distance,
                orientation: step.orientation,
                duration: step.duration,
              })),
            })),
          },
        };
        return {
          content: [{ type: "text", text: JSON.stringify(result) }],
        };
      } catch (error) {
        throw new Error(`Tool error: ${error.message}`);
      }
    },
  },
  "maps_direction_walking": {
    schema: z.object({
      origin: z.string(),
      destination: z.string(),
    }),
    handler: async ({ origin, destination }) => {
      try {
        const url = new URL("https://restapi.amap.com/v3/direction/walking");
        url.searchParams.append("key", AMAP_MAPS_API_KEY);
        url.searchParams.append("origin", origin);
        url.searchParams.append("destination", destination);
        url.searchParams.append("source", "ts_mcp");
        const response = await fetch(url.toString());
        const data = await response.json();
        if (data.status !== "1") {
          throw new Error(`Direction Walking failed: ${data.info || data.infocode}`);
        }
        const result = {
          route: {
            origin: data.route.origin,
            destination: data.route.destination,
            paths: data.route.paths.map((path) => ({
              distance: path.distance,
              duration: path.duration,
              steps: path.steps.map((step) => ({
                instruction: step.instruction,
                road: step.road,
                distance: step.distance,
                orientation: step.orientation,
                duration: step.duration,
              })),
            })),
          },
        };
        return {
          content: [{ type: "text", text: JSON.stringify(result) }],
        };
      } catch (error) {
        throw new Error(`Tool error: ${error.message}`);
      }
    },
  },
  "maps_direction_driving": {
    schema: z.object({
      origin: z.string(),
      destination: z.string(),
    }),
    handler: async ({ origin, destination }) => {
      try {
        const url = new URL("https://restapi.amap.com/v3/direction/driving");
        url.searchParams.append("key", AMAP_MAPS_API_KEY);
        url.searchParams.append("origin", origin);
        url.searchParams.append("destination", destination);
        url.searchParams.append("source", "ts_mcp");
        const response = await fetch(url.toString());
        const data = await response.json();
        if (data.status !== "1") {
          throw new Error(`Direction Driving failed: ${data.info || data.infocode}`);
        }
        const result = {
          route: {
            origin: data.route.origin,
            destination: data.route.destination,
            paths: data.route.paths.map((path) => ({
              distance: path.distance,
              duration: path.duration,
              steps: path.steps.map((step) => ({
                instruction: step.instruction,
                road: step.road,
                distance: step.distance,
                orientation: step.orientation,
                duration: step.duration,
              })),
            })),
          },
        };
        return {
          content: [{ type: "text", text: JSON.stringify(result) }],
        };
      } catch (error) {
        throw new Error(`Tool error: ${error.message}`);
      }
    },
  },
  "maps_direction_transit_integrated": {
    schema: z.object({
      origin: z.string(),
      destination: z.string(),
      city: z.string(),
      cityd: z.string(),
    }),
    handler: async ({ origin, destination, city, cityd }) => {
      try {
        const url = new URL("https://restapi.amap.com/v3/direction/transit/integrated");
        url.searchParams.append("key", AMAP_MAPS_API_KEY);
        url.searchParams.append("origin", origin);
        url.searchParams.append("destination", destination);
        url.searchParams.append("city", city);
        url.searchParams.append("cityd", cityd);
        url.searchParams.append("source", "ts_mcp");
        const response = await fetch(url.toString());
        const data = await response.json();
        if (data.status !== "1") {
          throw new Error(`Direction Transit Integrated failed: ${data.info || data.infocode}`);
        }
        const result = {
          route: {
            origin: data.route.origin,
            destination: data.route.destination,
            distance: data.route.distance,
            transits: data.route.transits.map((transit) => ({
              duration: transit.duration,
              walking_distance: transit.walking_distance,
              segments: transit.segments.map((segment) => ({
                walking: {
                  origin: segment.walking.origin,
                  destination: segment.walking.destination,
                  distance: segment.walking.distance,
                  duration: segment.walking.duration,
                  steps: segment.walking.steps.map((step) => ({
                    instruction: step.instruction,
                    road: step.road,
                    distance: step.distance,
                    action: step.action,
                    assistant_action: step.assistant_action,
                  })),
                },
                bus: {
                  buslines: segment.bus.buslines.map((busline) => ({
                    name: busline.name,
                    departure_stop: { name: busline.departure_stop.name },
                    arrival_stop: { name: busline.arrival_stop.name },
                    distance: busline.distance,
                    duration: busline.duration,
                    via_stops: busline.via_stops.map((via_stop) => ({ name: via_stop.name })),
                  })),
                },
                entrance: { name: segment.entrance.name },
                exit: { name: segment.exit.name },
                railway: { name: segment.railway.name, trip: segment.railway.trip },
              })),
            })),
          },
        };
        return {
          content: [{ type: "text", text: JSON.stringify(result) }],
        };
      } catch (error) {
        throw new Error(`Tool error: ${error.message}`);
      }
    },
  },
  "maps_distance": {
    schema: z.object({
      origins: z.string(),
      destination: z.string(),
      type: z.string().optional(),
    }),
    handler: async ({ origins, destination, type = "1" }) => {
      try {
        const url = new URL("https://restapi.amap.com/v3/distance");
        url.searchParams.append("key", AMAP_MAPS_API_KEY);
        url.searchParams.append("origins", origins);
        url.searchParams.append("destination", destination);
        url.searchParams.append("type", type);
        url.searchParams.append("source", "ts_mcp");
        const response = await fetch(url.toString());
        const data = await response.json();
        if (data.status !== "1") {
          throw new Error(`Direction Distance failed: ${data.info || data.infocode}`);
        }
        const result = {
          results: data.results.map((result) => ({
            origin_id: result.origin_id,
            dest_id: result.dest_id,
            distance: result.distance,
            duration: result.duration,
          })),
        };
        return {
          content: [{ type: "text", text: JSON.stringify(result) }],
        };
      } catch (error) {
        throw new Error(`Tool error: ${error.message}`);
      }
    },
  },
  "maps_text_search": {
    schema: z.object({
      keywords: z.string(),
      city: z.string().optional(),
      citylimit: z.string().optional(),
    }),
    handler: async ({ keywords, city = "", citylimit = "false" }) => {
      try {
        const url = new URL("https://restapi.amap.com/v3/place/text");
        url.searchParams.append("key", AMAP_MAPS_API_KEY);
        url.searchParams.append("keywords", keywords);
        url.searchParams.append("city", city);
        url.searchParams.append("citylimit", citylimit);
        url.searchParams.append("source", "ts_mcp");
        const response = await fetch(url.toString());
        const data = await response.json();
        if (data.status !== "1") {
          throw new Error(`Text Search failed: ${data.info || data.infocode}`);
        }
        const resciytes = data.suggestion?.ciytes?.map((city) => ({ name: city.name })) || [];
        const result = {
          suggestion: {
            keywords: data.suggestion?.keywords,
            ciytes: resciytes,
          },
          pois: data.pois.map((poi) => ({
            id: poi.id,
            name: poi.name,
            address: poi.address,
            typecode: poi.typecode,
          })),
        };
        return {
          content: [{ type: "text", text: JSON.stringify(result) }],
        };
      } catch (error) {
        throw new Error(`Tool error: ${error.message}`);
      }
    },
  },
  "maps_around_search": {
    schema: z.object({
      location: z.string(),
      radius: z.string().optional(),
      keywords: z.string().optional(),
    }),
    handler: async ({ location, radius = "1000", keywords = "" }) => {
      try {
        const url = new URL("https://restapi.amap.com/v3/place/around");
        url.searchParams.append("key", AMAP_MAPS_API_KEY);
        url.searchParams.append("location", location);
        url.searchParams.append("radius", radius);
        url.searchParams.append("keywords", keywords);
        url.searchParams.append("source", "ts_mcp");
        const response = await fetch(url.toString());
        const data = await response.json();
        if (data.status !== "1") {
          throw new Error(`Around Search failed: ${data.info || data.infocode}`);
        }
        const result = {
          pois: data.pois.map((poi) => ({
            id: poi.id,
            name: poi.name,
            address: poi.address,
            typecode: poi.typecode,
          })),
        };
        return {
          content: [{ type: "text", text: JSON.stringify(result) }],
        };
      } catch (error) {
        throw new Error(`Tool error: ${error.message}`);
      }
    },
  },
};

app.post("/messages", async (req, res) => {
  console.log("Received POST /messages:", req.body); // 日志：请求体
  try {
    const { type, name, arguments: args } = req.body;
    if (type !== "callTool" || !tools[name]) {
      console.error("Invalid request or tool:", { type, name });
      return res.status(400).json({ error: "Invalid request or tool" });
    }
    const tool = tools[name];
    const validatedArgs = tool.schema.parse(args); // 使用 Zod 验证
    const result = await tool.handler(validatedArgs);
    res.json(result);
  } catch (error) {
    console.error("Messages error:", error.message, error.stack); // 日志：错误详情
    res.status(500).json({ error: error.message });
  }
});

// CORS 支持
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "POST");
  next();
});

app.listen(3001, () => {
  console.log("MCP HTTP 服务运行在 http://localhost:3001");
});