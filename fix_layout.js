const fs = require('fs');

let pageContent = fs.readFileSync('h:\\chatbot\\client\\src\\app\\page.tsx', 'utf8');

pageContent = pageContent.replace(
    '<nav className="w-16 md:w-20 border-r border-white/5 bg-[#050810] flex flex-col items-center py-6 shrink-0">',
    '<nav className={`w-16 md:w-20 border-r border-white/5 bg-[#050810] flex flex-col items-center py-6 shrink-0 transition-all duration-500 ${activeTab === "survival" ? "-translate-x-full opacity-0 pointer-events-none !w-0" : "translate-x-0 opacity-100"}`}>'
);

pageContent = pageContent.replace(
    '<div className="flex-1 flex flex-col overflow-hidden relative">',
    '<div className={`flex-1 flex flex-col overflow-hidden relative transition-all duration-500 ${activeTab === "survival" ? "bg-black" : ""}`}>'
);

fs.writeFileSync('h:\\chatbot\\client\\src\\app\\page.tsx', pageContent);
console.log('Main Layout Adjusted');
