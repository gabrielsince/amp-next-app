"use client";

import { useState } from "react";
import { JSONTree } from "react-json-tree";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

// Custom theme for JSONTree matching light background
const jsonTreeTheme = {
  scheme: "light",
  base00: "#f7fafc", // bg-gray-50
  base01: "#e2e8f0", // gray-200
  base02: "#cbd5e0", // gray-400
  base03: "#a0aec0", // gray-500
  base04: "#718096", // gray-500
  base05: "#4a5568", // gray-700
  base06: "#2d3748", // gray-800
  base07: "#1a202c", // text-gray-800
  base08: "#9b2c2c", // red-700
  base09: "#276749", // green-700
  base0A: "#2b6cb0", // blue-600
  base0B: "#276749", // green-700
  base0C: "#2b6cb0", // blue-600
  base0D: "#2b6cb0", // blue-600
  base0E: "#9b2c2c", // red-700
  base0F: "#276749", // green-700
};

// Tool definitions with multi-language descriptions
const tools = {
  "amap-geocode": {
    params: ["query"],
    description: {
      en: "Convert detailed structured address to latitude and longitude coordinates.",
      zh: "将详细的结构化地址转换为经纬度坐标。",
      es: "Convertir dirección estructurada detallada a coordenadas de latitud y longitud.",
      ja: "詳細な構造化アドレスを緯度経度座標に変換します。",
    },
    inputExample: { query: "北京市朝阳区望京街" },
    outputExample: {
      geocodes: [
        {
          location: "116.481488,39.990464",
          province: "北京市",
          city: "北京市",
          district: "朝阳区",
        },
      ],
    },
  },
  "maps_regeocode": {
    params: ["location"],
    description: {
      en: "Convert latitude and longitude coordinates to administrative address information.",
      zh: "将经纬度坐标转换为行政区划地址信息。",
      es: "Convertir coordenadas de latitud y longitud a información de dirección administrativa。",
      ja: "緯度経度座標を行政区画住所情報に変換します。",
    },
    inputExample: { location: "116.481488,39.990464" },
    outputExample: {
      province: "北京市",
      city: "北京市",
      district: "朝阳区",
    },
  },
  "maps_geo": {
    params: ["address", "city"],
    description: {
      en: "Convert detailed structured address to latitude and longitude coordinates, supports specifying city.",
      zh: "将详细的结构化地址转换为经纬度坐标，支持指定城市。",
      es: "Convertir dirección estructurada detallada a coordenadas de latitud y longitud, permite especificar ciudad.",
      ja: "詳細な構造化アドレスを緯度経度座標に変換し、都市を指定できます。",
    },
    inputExample: { address: "望京街", city: "北京市" },
    outputExample: {
      return: [
        {
          country: "中国",
          province: "北京市",
          city: "北京市",
          district: "朝阳区",
          location: "116.481488,39.990464",
        },
      ],
    },
  },
  "maps_ip_location": {
    params: ["ip"],
    description: {
      en: "Locate the position based on the input IP address.",
      zh: "根据输入的 IP 地址定位其所在位置。",
      es: "Ubicar la posición según la dirección IP ingresada。",
      ja: "入力されたIPアドレスに基づいて位置を特定します。",
    },
    inputExample: { ip: "114.114.114.114" },
    outputExample: {
      province: "北京市",
      city: "北京市",
      adcode: "110000",
      rectangle: "116.011934,39.661271;116.782983,40.216977",
    },
  },
  "maps_weather": {
    params: ["city"],
    description: {
      en: "Query the weather forecast for a specified city by name or adcode.",
      zh: "根据城市名称或 adcode 查询指定城市的天气预报。",
      es: "Consultar el pronóstico del tiempo para una ciudad específica por nombre o código administrativo。",
      ja: "都市名または行政コードで指定された都市の天気予報を問い合わせます。",
    },
    inputExample: { city: "北京市" },
    outputExample: {
      city: "北京市",
      forecasts: [
        {
          date: "2025-04-20",
          dayweather: "晴",
          nightweather: "多云",
          daytemp: "20",
          nighttemp: "10",
        },
      ],
    },
  },
  "maps_search_detail": {
    params: ["id"],
    description: {
      en: "Query detailed information of a POI ID obtained from keyword or nearby search.",
      zh: "查询关键词搜索或周边搜索获取的 POI ID 的详细信息。",
      es: "Consultar información detallada de un ID de POI obtenido de una búsqueda por palabra clave o cercana。",
      ja: "キーワード検索または周辺検索で取得したPOI IDの詳細情報を問い合わせます。",
    },
    inputExample: { id: "B0FFH2KX2Y" },
    outputExample: {
      id: "B0FFH2KX2Y",
      name: "望京SOHO",
      location: "116.481488,39.990464",
      address: "北京市朝阳区望京街",
      city: "北京市",
    },
  },
  "maps_bicycling": {
    params: ["origin", "destination"],
    description: {
      en: "Plan a cycling commute, supports up to 500km.",
      zh: "规划骑行通勤方案，最大支持 500km。",
      es: "Planificar un trayecto en bicicleta, soporta hasta 500 km。",
      ja: "最大500kmまでのサイクリング通勤を計画します。",
    },
    inputExample: { origin: "116.481488,39.990464", destination: "116.397451,39.904214" },
    outputExample: {
      data: {
        origin: "116.481488,39.990464",
        destination: "116.397451,39.904214",
        paths: [
          {
            distance: 5000,
            duration: 1200,
            steps: [{ instruction: "沿望京街向南骑行", distance: 1000 }],
          },
        ],
      },
    },
  },
  "maps_direction_walking": {
    params: ["origin", "destination"],
    description: {
      en: "Plan a walking commute within 100km.",
      zh: "规划 100km 以内的步行通勤方案。",
      es: "Planificar un trayecto a pie dentro de 100 km。",
      ja: "100km以内の徒歩通勤を計画します。",
    },
    inputExample: { origin: "116.481488,39.990464", destination: "116.397451,39.904214" },
    outputExample: {
      route: {
        origin: "116.481488,39.990464",
        destination: "116.397451,39.904214",
        paths: [
          {
            distance: 2000,
            duration: 1800,
            steps: [{ instruction: "沿望京街向南步行", distance: 500 }],
          },
        ],
      },
    },
  },
  "maps_direction_driving": {
    params: ["origin", "destination"],
    description: {
      en: "Plan a driving commute for cars or small vehicles.",
      zh: "规划小客车或轿车的驾车通勤方案。",
      es: "Planificar un trayecto en coche para vehículos pequeños。",
      ja: "小型車または乗用車の運転通勤を計画します。",
    },
    inputExample: { origin: "116.481488,39.990464", destination: "116.397451,39.904214" },
    outputExample: {
      route: {
        origin: "116.481488,39.990464",
        destination: "116.397451,39.904214",
        paths: [
          {
            distance: 10000,
            duration: 600,
            steps: [{ instruction: "沿望京街向南行驶", distance: 2000 }],
          },
        ],
      },
    },
  },
  "maps_direction_transit_integrated": {
    params: ["origin", "destination", "city", "cityd"],
    description: {
      en: "Plan a comprehensive public transit commute (train, bus, subway).",
      zh: "规划综合公共交通（火车、公交、地铁）的通勤方案。",
      es: "Planificar un trayecto de transporte público integral (tren, autobús, metro).",
      ja: "総合的な公共交通（電車、バス、地下鉄）の通勤を計画します。",
    },
    inputExample: {
      origin: "116.481488,39.990464",
      destination: "121.473704,31.230416",
      city: "北京市",
      cityd: "上海市",
    },
    outputExample: {
      route: {
        origin: "116.481488,39.990464",
        destination: "121.473704,31.230416",
        distance: 1200000,
        transits: [
          {
            duration: 7200,
            segments: [
              {
                bus: {
                  buslines: [{ name: "北京到上海高铁", duration: 7200 }],
                },
              },
            ],
          },
        ],
      },
    },
  },
  "maps_distance": {
    params: ["origins", "destination", "type"],
    description: {
      en: "Measure the distance between two coordinates (driving, walking, or straight line).",
      zh: "测量两个经纬度坐标之间的距离（驾车、步行或直线）。",
      es: "Medir la distancia entre dos coordenadas (conducción, caminata o línea recta).",
      ja: "2つの座標間の距離を測定します（運転、徒歩、または直線）。",
    },
    inputExample: { origins: "116.481488,39.990464", destination: "116.397451,39.904214", type: "1" },
    outputExample: {
      results: [
        {
          origin_id: 1,
          dest_id: 1,
          distance: 10000,
          duration: 600,
        },
      ],
    },
  },
  "maps_text_search": {
    params: ["keywords", "city", "citylimit"],
    description: {
      en: "Search for related POI information based on keywords.",
      zh: "根据关键词搜索相关的 POI 信息。",
      es: "Buscar información de POI relacionada según palabras clave。",
      ja: "キーワードに基づいて関連するPOI情報を検索します。",
    },
    inputExample: { keywords: "加油站", city: "北京市", citylimit: "true" },
    outputExample: {
      suggestion: { keywords: [], cities: [] },
      pois: [
        {
          id: "B0FFH2KX2Y",
          name: "中国石化加油站",
          address: "北京市朝阳区望京街",
          typecode: "010100",
        },
      ],
    },
  },
  "maps_around_search": {
    params: ["location", "radius", "keywords"],
    description: {
      en: "Search for nearby POIs based on center coordinates and radius.",
      zh: "根据中心点坐标和半径搜索周边 POI。",
      es: "Buscar POIs cercanos según coordenadas centrales y radio。",
      ja: "中心座標と半径に基づいて周辺のPOIを検索します。",
    },
    inputExample: { location: "116.481488,39.990464", radius: "1000", keywords: "餐厅" },
    outputExample: {
      pois: [
        {
          id: "B0FFH2KX2Y",
          name: "望京餐厅",
          address: "北京市朝阳区望京街",
          typecode: "050100",
        },
      ],
    },
  },
};

// Fallback component if JSONTree is undefined
const JsonTreeFallback = ({ data }) => (
  <pre>{JSON.stringify(data, null, 2)}</pre>
);

export default function Home({ params: { locale } }) {
  const t = useTranslations("home");
  const router = useRouter();
  const [selectedTool, setSelectedTool] = useState("amap-geocode");
  const [params, setParams] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle tool selection change
  const handleToolChange = (e) => {
    setSelectedTool(e.target.value);
    setParams({});
    setResult(null);
    setError(null);
  };

  // Handle parameter input change
  const handleParamChange = (param, value) => {
    setParams((prev) => ({ ...prev, [param]: value }));
  };

  // Fill example data into text boxes
  const fillExampleData = () => {
    const exampleData = tools[selectedTool].inputExample;
    setParams(exampleData);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolName: selectedTool,
          arguments: params,
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const content = data.result?.content?.[0]?.text;
      let parsedResult = content;
      try {
        parsedResult = JSON.parse(content);
      } catch (err) {
        console.warn("Result is not valid JSON, using raw content");
      }
      setResult(parsedResult);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Language switcher
  const changeLanguage = (lang) => {
    router.push(`/${lang}`);
  };

  // Use fallback if JSONTree is undefined
  const JsonTreeComponent = JSONTree || JsonTreeFallback;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-center">{t("title")}</h1>

        {/* Language switcher */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => changeLanguage("en")}
            className="mr-2 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            English
          </button>
          <button
            onClick={() => changeLanguage("zh")}
            className="mr-2 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            中文
          </button>
          <button
            onClick={() => changeLanguage("es")}
            className="mr-2 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            Español
          </button>
          <button
            onClick={() => changeLanguage("ja")}
            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            日本語
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tool selection */}
          <div>
            <label htmlFor="tool" className="block text-sm font-medium text-gray-700">
              {t("toolSelection")}
            </label>
            <select
              id="tool"
              value={selectedTool}
              onChange={handleToolChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            >
              {Object.keys(tools).map((tool) => (
                <option key={tool} value={tool}>
                  {tool}
                </option>
              ))}
            </select>
          </div>

          {/* Tool description */}
          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="text-lg font-semibold text-blue-800">{t("toolDescription")}</h3>
            <p className="mt-2 text-sm text-gray-700">
              {tools[selectedTool].description[locale] || tools[selectedTool].description.en}
            </p>
          </div>

          {/* Dynamic parameter inputs */}
          {tools[selectedTool].params.map((param) => (
            <div key={param}>
              <label htmlFor={param} className="block text-sm font-medium text-gray-700">
                {param}
              </label>
              <input
                id={param}
                type="text"
                value={params[param] || ""}
                onChange={(e) => handleParamChange(param, e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                placeholder={`${t("example")}: ${tools[selectedTool].inputExample[param] || ""}`}
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                {t("example")}: {tools[selectedTool].inputExample[param]}
              </p>
            </div>
          ))}

          {/* Fill example data button */}
          <button
            type="button"
            onClick={fillExampleData}
            className="w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700"
          >
            {t("fillExampleData")}
          </button>

          {/* Output example */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-semibold text-gray-800">{t("outputExample")}</h3>
            <JsonTreeComponent
              data={tools[selectedTool].outputExample}
              theme={jsonTreeTheme}
              invertTheme={false}
              shouldExpandNode={() => true}
              style={{ padding: "10px", borderRadius: "4px" }}
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? t("loading") : t("query")}
          </button>
        </form>

        {/* Error message */}
        {error && (
          <p className="mt-4 text-red-600 bg-red-50 p-2 rounded-md">
            {t("error")}: {error}
          </p>
        )}

        {/* Query result */}
        {result && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold">{t("queryResult")}</h2>
            <JsonTreeComponent
              data={result}
              theme={jsonTreeTheme}
              invertTheme={false}
              shouldExpandNode={() => true}
              style={{ padding: "10px", borderRadius: "4px" }}
            />
          </div>
        )}
      </div>
    </div>
  );
}