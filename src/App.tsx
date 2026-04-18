/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  RefreshCw, 
  ShoppingBag, 
  Zap,
  MessageSquare,
  Video,
  Crown,
  User
} from "lucide-react";
import { useState, useRef } from "react";

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface Script {
  type: string;
  content: string;
  characterDesc: string;
  videoPrompts: string[];
  icon: any;
}

export default function App() {
  const [productName, setProductName] = useState("");
  const [style, setStyle] = useState("professional");
  const [gender, setGender] = useState("female");
  const [scripts, setScripts] = useState<Script[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const styles = [
    { id: "professional", label: "Chuyên nghiệp", icon: Zap, color: "bg-blue-500" },
    { id: "funny", label: "Hài hước", icon: MessageSquare, color: "bg-pink-500" },
    { id: "shock", label: "Gây sốc/Drama", icon: Sparkles, color: "bg-amber-500" },
    { id: "boss", label: "Đại ca", icon: Crown, color: "bg-purple-500" },
  ];

  const generateScripts = async () => {
    if (!productName.trim()) return;

    setIsLoading(true);
    setScripts([]);
    
    try {
      const stylePrompts: Record<string, string> = {
        professional: "Chuyên nghiệp, thuyết phục, tập trung vào giá trị và lợi ích thực tế.",
        funny: "Hài hước, gần gũi, sử dụng các câu nói 'trend' của giới trẻ, tạo sự thoải mái.",
        shock: "Cực kỳ khẩn cấp, gây sốc, theo phong cách 'lỗi giá' hoặc 'xả kho gấp'. Ví dụ: Chạy bộ hớt hải, hét to thông báo giảm giá sập sàn, thúc giục mua ngay kẻo hết.",
        boss: "Phong cách 'Đại ca', giang hồ mạng nhưng trượng nghĩa. Sử dụng các câu như: 'Để anh nói cho mấy đứa nghe', 'Để anh nói cho mấy con ghệ nghe', 'Nghe anh nói này', ngôn ngữ mạnh mẽ, dứt khoát, ra dáng đàn anh bảo vệ quyền lợi cho đàn em."
      };

      const prompt = `Bạn là một chuyên gia viết kịch bản bán hàng (copywriter) hàng đầu trên TikTok/Mạng xã hội.
      Hãy viết 3 mẫu kịch bản bán hàng ngắn (khoảng 8-16 giây khi đọc) cho sản phẩm: ${productName}.
      
      Giới tính nhân vật chính: ${gender === 'male' ? 'Nam' : 'Nữ'}
      Phong cách mong muốn: ${stylePrompts[style]}
      
      Yêu cầu cho nội dung kịch bản:
      - Ngôn ngữ: Tiếng Việt.
      - **BẮT BUỘC:** Phải nhắc đến tên sản phẩm (${productName}) ít nhất một lần trong nội dung kịch bản để tăng tính nhận diện.
      - Có đầy đủ: Hook (mở đầu gây chú ý), Body (nội dung chính), CTA (kêu gọi hành động).
      - Trình bày rõ ràng, nhắm vào tâm lý đám đông.

      Yêu cầu bổ sung cho MIÊU TẢ NHÂN VẬT (character_desc):
      - Hãy miêu tả chi tiết ngoại hình, trang phục, và thần thái của nhân vật chính trong video (Phải là nhân vật ${gender === 'male' ? 'Nam' : 'Nữ'}).
      - **PHONG CÁCH TRANG PHỤC:**
        + Nếu là **Nữ**: Trang phục PHẢI cực kỳ hấp dẫn và tôn dáng. Ưu tiên: mặc **đầm body quyến rũ** để lộ đôi chân dài miên man, hoặc **bộ đồ tập gym ôm sát** cơ thể khoe trọn vóc dáng đồng hồ cát nóng bỏng. Đặc biệt, nhân vật Nữ phải mang thêm **trang sức đắt tiền, lấp lánh** (như dây chuyền kim cương, vòng tay vàng, đồng hồ sang trọng) để tăng vẻ thượng lưu và thu hút. Trang phục phải hiện đại, "mát mẻ", lôi cuốn người xem ngay lập tức.
        + Nếu là **Nam**: Ưu tiên trang phục nam tính, năng động, phong trần (có thể là áo polo ôm dáng hoặc trang phục địa phương phù hợp bối cảnh).
      - **BỐI CẢNH DANH LAM THẮNG CẢNH NỔI TIẾNG VIỆT NAM:** Hãy sáng tạo và tối ưu bối cảnh dựa trên các địa danh nổi tiếng:
        + **Hà Nội:** Hồ Gươm với Tháp Rùa cổ kính, phố cổ nhộn nhịp.
        + **Hạ Long:** Vịnh Hạ Long hùng vĩ với những đảo đá vôi kỳ ảo trên biển xanh.
        + **Miền Trung:** Phố cổ Hội An đèn lồng rực rỡ, hoặc Cầu Rồng (Đà Nẵng).
        + **Sài Gòn:** Bưu điện Thành Phố, nhà thờ Đức Bà, hoặc cảnh phố phường hiện đại tấp nập.
        + **Miền Tây:** Chợ nổi náo nhiệt trên sông, ghe xuồng tấp nập, ruộng đồng cò bay thẳng cánh, vườn trái cây sum suê.
      - Chú ý: Phải làm người xem bị kích thích thị giác mạnh mẽ, chú ý ngay lập tức vào video (đặc biệt là sự nóng bỏng, lôi cuốn của nhân vật hòa quyện với cảnh đẹp).

      Yêu cầu bổ sung cho VIDEO PROMPTS (video_prompts):
      - Hãy viết duy nhất **01 (MỘT)** "Video Prompt" mô tả cảnh quay chính cho kịch bản này.
      - Prompt tương ứng với một cảnh quay dài khoảng 8-15 giây.
      - **QUAN TRỌNG: TRONG PROMPT, BẮT BUỘC phải BẮT ĐẦU bằng việc TRÍCH DẪN NGUYÊN VĂN toàn bộ phần Miêu tả nhân vật (character_desc) đã viết ở trên.** Nhân vật và bối cảnh phải thống nhất.
      - **YÊU CẦU MỚI:** Trong prompt, hãy thêm rõ phần "Lời thoại tiếng Việt" và "Âm thanh nền" (Background Sound/SFX) phù hợp với kịch bản và bối cảnh được chọn. **Âm thanh nền BẮT BUỘC phải là: Nhạc EDM Bass Boosted cực sung** kết hợp với âm thanh môi trường đặc trưng của địa danh đó.
      - **LƯU Ý:** 
        + KHÔNG ĐƯỢC cho sản phẩm xuất hiện về mặt hình ảnh (visual) trong prompt. Nhân vật chỉ thực hiện hành động sốc, hớt hải, chỉ tay vào nơi dự kiến ghép sản phẩm sau này. Tuy nhiên, PHẢI nhắc tên sản phẩm trong phần "Lời thoại tiếng Việt" của nhân vật.
        + **BẮT BUỘC:** Ở cuối mỗi Video Prompt, phải thêm dòng chữ: "Video không phụ đề".
      
      Trả về kết quả theo định dạng JSON cực kỳ nghiêm ngặt như ví dụ sau (không có văn bản nào ngoài JSON, không dùng markdown):
      [
        {
          "type": "Video Ngắn (Trend)", 
          "content": "...nội dung kịch bản...", 
          "character_desc": "...miêu tả nhân vật thu hút...",
          "video_prompts": [
            "[Miêu tả nhân vật nguyên văn] + [Hành động cụ thể] + [Lời thoại tiếng Việt: '...'] + [Âm thanh nền: '...'] + Video không phụ đề"
          ]
        }
      ]`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const result = JSON.parse(response.text || "[]");
      
      const icons = [Video, Zap, MessageSquare];
      const scriptsWithIcons = result.map((s: any, idx: number) => ({
        ...s,
        characterDesc: s.character_desc || "",
        videoPrompts: s.video_prompts || [],
        icon: icons[idx % icons.length]
      }));

      setScripts(scriptsWithIcons);
      
      // Scroll to result after a short delay to allow rendering
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error("Error generating scripts:", error);
      alert("Đã có lỗi xảy ra khi tạo kịch bản. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div id="app-container" className="min-h-screen text-white font-sans selection:bg-[#38bdf8]/30 selection:text-[#38bdf8]">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#38bdf8]/10 blur-[150px] rounded-full animate-pulse opacity-50" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#818cf8]/10 blur-[150px] rounded-full animate-pulse delay-1000 opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-white/[0.01] blur-[200px] rounded-full" />
      </div>

      <div className="w-full h-screen max-w-full mx-auto flex flex-col md:flex-row gap-0 relative overflow-hidden">
        
        {/* Left Side - Options (30%) */}
        <aside className="w-full md:w-[320px] lg:w-[380px] xl:w-[420px] h-full flex flex-col p-6 md:p-10 space-y-10 bg-white/[0.02] border-r border-white/5 backdrop-blur-3xl z-20 shrink-0 overflow-y-auto custom-scrollbar">
          {/* Header */}
          <motion.header 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-left space-y-6"
          >
            <div className="relative inline-flex items-center justify-center p-4 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl group transition-all duration-500 hover:scale-110">
              <ShoppingBag className="w-10 h-10 text-[#38bdf8] drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]" />
              <div className="absolute inset-0 bg-[#38bdf8]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-br from-white via-white to-[#38bdf8] bg-clip-text text-transparent">
                Kịch Bản Bán Hàng
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
                <p className="text-white/40 text-[10px] uppercase tracking-widest font-black">
                  Powered by Gemini AI v3
                </p>
              </div>
            </div>
          </motion.header>

          {/* Main Input Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-8 flex-1"
          >
            <div className="space-y-3">
              <label htmlFor="product-name" className="flex items-center gap-2 text-[10px] uppercase tracking-[3px] font-black text-white/50 ml-1">
                <Zap className="w-3 h-3 text-[#38bdf8]" />
                Sản phẩm của bạn
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#38bdf8]/20 to-[#818cf8]/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="inner-glass p-1.5 rounded-2xl relative">
                  <input
                    id="product-name"
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Ví dụ: Mỹ phẩm sạch, Robot AI..."
                    className="w-full px-6 py-5 bg-transparent outline-none text-white text-lg placeholder:text-white/10 font-light"
                    onKeyDown={(e) => e.key === 'Enter' && generateScripts()}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] uppercase tracking-[3px] font-black text-white/50 ml-1">
                <User className="w-3 h-3 text-[#818cf8]" />
                Nhân vật chính
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'female', label: 'Nữ', icon: User },
                  { id: 'male', label: 'Nam', icon: User },
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGender(g.id)}
                    className={`relative group flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all duration-500 overflow-hidden ${
                      gender === g.id 
                        ? 'bg-[#818cf8]/20 border-[#818cf8]/50 text-white shadow-[0_0_20px_rgba(129,140,248,0.2)]' 
                        : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10 hover:border-white/10'
                    }`}
                  >
                    {gender === g.id && (
                      <motion.div layoutId="gender-blob" className="absolute inset-0 bg-gradient-to-br from-[#818cf8]/10 to-[#38bdf8]/10" />
                    )}
                    <g.icon className={`w-5 h-5 relative z-10 ${g.id === 'female' ? '' : 'rotate-180'}`} />
                    <span className="text-xs font-black uppercase tracking-widest relative z-10">{g.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-[10px] uppercase tracking-[3px] font-black text-white/50 ml-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Phong cách Script
              </label>
              <div className="grid grid-cols-2 gap-3">
                {styles.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    className={`relative group flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border transition-all duration-500 ${
                      style === s.id 
                        ? 'bg-[#38bdf8]/20 border-[#38bdf8]/50 text-white shadow-[0_0_20px_rgba(56,189,248,0.2)]' 
                        : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10 hover:border-white/10'
                    }`}
                  >
                    {style === s.id && (
                      <motion.div layoutId="style-blob" className="absolute inset-0 bg-gradient-to-br from-[#38bdf8]/10 to-[#818cf8]/10" />
                    )}
                    <s.icon className={`w-6 h-6 relative z-10 transition-transform duration-500 group-hover:scale-110 ${style === s.id ? 'text-[#38bdf8]' : ''}`} />
                    <span className="text-[9px] font-black uppercase tracking-widest text-center leading-tight relative z-10">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={generateScripts}
              disabled={isLoading || !productName.trim()}
              className="relative group w-full h-16 rounded-[24px] overflow-hidden transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#38bdf8] via-[#818cf8] to-[#38bdf8] bg-[length:200%_auto] animate-gradient transition-all duration-500" />
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative flex items-center justify-center gap-3 text-[#0f172a] font-black uppercase tracking-[3px] text-sm md:text-base">
                {isLoading ? (
                  <RefreshCw className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-6 h-6" />
                    Tạo Ma Thuật
                  </>
                )}
              </div>
            </button>
          </motion.section>

          {/* Suggestions */}
          {!scripts.length && !isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4 pt-6 border-t border-white/5"
            >
              <p className="text-[9px] text-white/30 font-black uppercase tracking-[3px]">Tên nhanh</p>
              <div className="flex flex-wrap gap-2">
                {["Trang phục Gym", "Mỹ phẩm sạch", "Gia sư AI", "Cỏ nhân tạo"].map((tip) => (
                  <button
                    key={tip}
                    onClick={() => setProductName(tip)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[9px] font-black tracking-widest text-white/50 transition-all hover:text-white hover:border-[#38bdf8]/30 uppercase"
                  >
                    {tip}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Copyright */}
          <footer className="pt-8 text-left opacity-30 mt-auto">
            <p className="text-[9px] font-black tracking-[3px] uppercase">
              © 2026 Kịch Bản Bán Hàng
            </p>
          </footer>
        </aside>

        {/* Right Side - Results (70%) */}
        <main className="flex-1 h-full p-6 md:p-12 lg:p-20 overflow-y-auto custom-scrollbar relative z-10 bg-black/20">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="h-full flex flex-col items-center justify-center space-y-10"
              >
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border border-white/5 animate-pulse" />
                  <div className="absolute inset-0 w-32 h-32 rounded-full border-t-2 border-[#38bdf8] animate-spin" />
                  <div className="absolute inset-0 w-32 h-32 rounded-full border-r-2 border-[#818cf8] animate-spin [animation-duration:3s]" />
                  <Sparkles className="absolute inset-0 m-auto w-12 h-12 text-[#38bdf8] animate-pulse" />
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-black uppercase tracking-[8px] text-white/90">Đang khởi tạo</h2>
                  <p className="text-white/40 text-[10px] uppercase tracking-[4px]">Kịch bản tối ưu triệu view đang sẵn sàng...</p>
                </div>
              </motion.div>
            ) : scripts.length > 0 ? (
              <div key="results" ref={resultRef} className="max-w-5xl mx-auto space-y-16 pb-24">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col md:flex-row items-baseline md:items-center justify-between gap-4 border-b border-white/10 pb-10"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-[#38bdf8] rounded-md" />
                      <h2 className="text-2xl font-black uppercase tracking-[4px] text-white">Kết quả sáng tạo</h2>
                    </div>
                    <p className="text-white/40 text-xs font-light tracking-wide pl-7">Chọn kịch bản phù hợp nhất cho chiến dịch của bạn</p>
                  </div>
                  <button 
                    onClick={() => {
                      setProductName("");
                      setScripts([]);
                    }}
                    className="flex items-center gap-2 text-white/30 hover:text-red-400 text-[10px] font-black uppercase tracking-[3px] transition-all group pr-2"
                  >
                    <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
                    Reset nội dung
                  </button>
                </motion.div>

                <div className="grid grid-cols-1 gap-12">
                  {scripts.map((script, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1, type: "spring", damping: 20 }}
                      className="group relative"
                    >
                      {/* Card Background with Glow */}
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#38bdf8]/30 via-[#818cf8]/30 to-[#38bdf8]/30 rounded-[40px] blur-2xl opacity-0 group-hover:opacity-100 transition duration-700 mx-4" />
                      
                      <div className="relative bg-[#0f172a]/80 backdrop-blur-3xl rounded-[40px] border border-white/5 overflow-hidden shadow-2xl">
                        {/* Header bar */}
                        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 shadow-inner group-hover:border-[#38bdf8]/30 transition-colors">
                              <script.icon className="w-6 h-6 text-[#38bdf8]" />
                            </div>
                            <h3 className="font-black text-white text-base uppercase tracking-[4px]">{script.type}</h3>
                          </div>
                          <button
                            onClick={() => copyToClipboard(script.content, idx)}
                            className="flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-[#38bdf8] rounded-2xl transition-all duration-500 text-white/60 hover:text-[#0f172a] border border-white/5 hover:border-transparent group/btn shadow-xl active:scale-95"
                          >
                            {copiedIndex === idx ? (
                              <><Check className="w-4 h-4" /><span className="text-[10px] font-black uppercase tracking-widest">Đã chép</span></>
                            ) : (
                              <><Copy className="w-4 h-4 transition-transform group-hover/btn:-translate-y-0.5" /><span className="text-[10px] font-black uppercase tracking-widest">Sao chép kịch bản</span></>
                            )}
                          </button>
                        </div>
                        
                        <div className="p-10 md:p-14 space-y-12">
                          <div className="relative pl-8 md:pl-12">
                            <div className="absolute left-0 top-0 w-1.5 h-full bg-gradient-to-b from-[#38bdf8] to-transparent rounded-full opacity-60 shadow-[0_0_20px_rgba(56,189,248,0.5)]" />
                            <p className="text-white text-xl md:text-3xl leading-[1.6] md:leading-[1.6] font-extralight tracking-tight italic">
                              {script.content}
                            </p>
                          </div>

                          {script.characterDesc && (
                            <div className="space-y-12">
                              <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-[1px] bg-[#818cf8]" />
                                  <span className="text-[10px] uppercase tracking-[5px] font-black text-[#818cf8]">Visual Blueprint</span>
                                </div>
                                <div className="bg-white/[0.03] p-8 rounded-[32px] border border-white/5 leading-relaxed text-white/70 text-base md:text-lg font-light shadow-inner">
                                  {script.characterDesc}
                                </div>
                              </div>

                              {script.videoPrompts && script.videoPrompts.length > 0 && (
                                <div className="space-y-6">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-[1px] bg-[#38bdf8]" />
                                    <span className="text-[10px] uppercase tracking-[5px] font-black text-[#38bdf8]">Video AI Gen Prompts</span>
                                  </div>
                                  <div className="grid grid-cols-1 gap-4">
                                    {script.videoPrompts.map((p, pIdx) => (
                                      <div key={pIdx} className="group/p relative">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#38bdf8] to-[#818cf8] rounded-[24px] opacity-0 group-hover/p:opacity-20 transition-opacity blur-lg" />
                                        <div className="relative text-sm md:text-base text-white/50 bg-[#0f172a]/40 p-6 rounded-[24px] border border-white/5 leading-relaxed font-mono italic pr-16 shadow-xl">
                                          <span className="font-black text-[#38bdf8] block mb-3 uppercase tracking-widest text-[10px]">Cấu trúc AI Prompt:</span>
                                          {p}
                                        </div>
                                        <button
                                          onClick={() => copyToClipboard(p, idx + 100 + pIdx)}
                                          className="absolute right-4 top-4 p-3 opacity-0 group-hover/p:opacity-100 transition-all bg-[#38bdf8] text-[#0f172a] rounded-xl shadow-[0_10px_30px_rgba(56,189,248,0.4)] active:scale-90 hover:scale-110"
                                          title="Sao chép prompt"
                                        >
                                          {copiedIndex === idx + 100 + pIdx ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-8 space-y-12"
              >
                <div className="relative group">
                  <div className="absolute -inset-10 bg-[#38bdf8]/10 blur-[100px] rounded-full animate-pulse group-hover:bg-[#38bdf8]/20 transition-all" />
                  <div className="w-40 h-40 rounded-[56px] bg-white/[0.03] flex items-center justify-center border border-white/10 rotate-12 shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative z-10 transition-transform duration-700 hover:rotate-0 hover:scale-110">
                    <Zap className="w-20 h-20 text-white/10" />
                  </div>
                </div>
                <div className="max-w-xl space-y-6 relative z-10">
                  <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-tight">Biến ý tưởng thành<br/><span className="bg-gradient-to-r from-[#38bdf8] to-[#818cf8] bg-clip-text text-transparent">Kịch bản triệu đô</span></h3>
                  <p className="text-white/30 text-lg md:text-xl font-light leading-relaxed max-w-md mx-auto">
                    Kịch bản thông minh, thấu hiểu tâm lý khách hàng, tối ưu hóa cho nền tảng video ngắn.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
