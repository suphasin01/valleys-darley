import Link from "next/link";
import { getCmsContent, localizedContent } from "./lib/cms";
import { getLocale } from "./lib/locale";
import { FigmaImage } from "./components/FigmaImage";
import { editorialImage } from "./lib/editorial-images";

export const dynamic = "force-dynamic";
const asset = (id: number) => `/images/figma/landing-${id}.webp`;
const features = [
 { id:"ribbon-earring", name:"pleated gemstone ribbon earring", image:11, crop:{width:"132.44%",height:"355.22%",left:"-2.01%",top:"-161.29%"} },
 { id:"swirl-bow", name:"classic swirl bow necklace", image:12, crop:{width:"117.46%",height:"313.98%",left:"-8.69%",top:"-120.09%"} },
 { id:"pearl-ring", name:"rosette ribbon mother of pearl ring", image:9, crop:{width:"98.69%",height:"270.87%",left:".60%",top:"-80.57%"} },
 { id:"heart-locket", name:"the ruffle heart locket necklace", image:10, crop:{width:"102.29%",height:"257.08%",left:"-.54%",top:"-94.32%"} },
];
export default async function Home() {
 const locale=await getLocale();
 const content=localizedContent(await getCmsContent(),locale);
 const th=locale==="th";
 return <main className="editorial-page figma-home overflow-hidden bg-white text-black">
  <div className="flex min-h-8 items-center justify-center bg-[#f1e9eb] px-4 py-[1.5%] text-center text-[clamp(.6rem,1.67vw,1.5rem)] font-semibold">{th?"ยินดีต้อนรับสู่ Valley’s Darling":"enjoy free international shipping on orders over 300 USD."}</div>
  <section className="relative aspect-[1440/914]">
   <FigmaImage src={asset(5)} alt="Gemstone ribbon earrings in morning light" priority className="absolute inset-0"/>
   <h1 className="absolute inset-x-0 top-[5%] text-center text-[clamp(.65rem,2.22vw,2rem)] font-semibold">{th?"ยินดีต้อนรับสู่โลกใบเล็กของเรา":"WELCOME TO OUR LITTLE WORLD"}</h1>
   <Link href="/about" className="figma-cta absolute bottom-[8%] left-1/2 -translate-x-1/2 bg-white">{th?"ค้นพบโลกของเรา":"discover the world"}</Link>
  </section>
  <section aria-label="Our editorial story" className="grid grid-cols-2 gap-[1.7%] px-[1.4%] pt-[1.7%]">
   <Link href="/about"><FigmaImage src={asset(4)} alt="A woman in a pink room beneath a chandelier" className="aspect-[759/1011]" crop={{width:"100%",height:"100.12%",left:0,top:"2.11%"}}/></Link>
   <Link href="/about"><FigmaImage src={asset(3)} alt="Mother of pearl ring worn beside a birthday cake" className="aspect-[755/1006]"/></Link>
  </section>
  <section className="relative pb-[4.1%] text-center">
   <FigmaImage src={asset(6)} className="aspect-[1535/260] opacity-80" crop={{width:"167.07%",height:"619.41%",left:"-17.77%",top:"-.07%"}}/>
   <FigmaImage src={asset(7)} alt="Keepsakes of wonder and Romance" className="mx-auto -mt-[3%] aspect-[847.62/265.389] w-[59%] rotate-[-9.16deg]" crop={{width:"200.42%",height:"799.84%",left:"-45.51%",top:"-501.75%"}}/>
   <p className="mx-auto mt-[3%] max-w-[74%] text-[clamp(.75rem,2.22vw,2rem)] font-semibold leading-tight">{th?content.home.storyBody:"this collection is inspired by the ribbon — reshaped into rosettes and countless other forms"}</p>
   <Link href="/collections" className="figma-cta mt-[4%] bg-[#f1e9eb]">{th?"ดูคอลเลกชัน":"explore collection"}</Link>
  </section>
  <section className="bg-[#f1e9eb]">
   <div className="flex items-center justify-between gap-4 border-y border-black/30 px-[2.2%] py-[1.3%]">
    <h2 className="text-[clamp(1.5rem,7.2vw,6.5rem)] leading-none">{th?content.customMade.heading:"custom made"}</h2>
    <p className="max-w-[38%] text-right text-[clamp(.6rem,2.5vw,2.25rem)] font-semibold leading-tight">{th?"เครื่องประดับสั่งทำ ที่สร้างจากจินตนาการของคุณ":<>custom-made jewelry,<br/>crafted around your imagination.</>}</p>
   </div>
   <div className="mx-auto grid w-[89%] grid-cols-3 gap-[2%] pb-[1%] pt-[9.5%]">
    {[{left:"-64.69%",top:"-112.81%"},{left:"-122.35%",top:"-19.43%"},{left:"-194.85%",top:"-104.46%"}].map((crop,i)=><Link key={i} href="/custom-made" className="transition-transform duration-500 hover:scale-105"><FigmaImage src={asset(0)} alt={["Heart locket design","Ribbon bow locket design","Gemstone locket design"][i]} className="aspect-[384/379]" crop={{...crop,width:"419.08%",height:"238.69%"}}/></Link>)}
   </div>
   <div className="flex items-center justify-between gap-5 px-[11.6%] pb-[7%] pt-[7%]">
    <Link href="/custom-made" className="figma-cta shrink-0 bg-white">{th?content.customMade.cta:"create yours"}</Link>
    <p className="max-w-[55%] text-right text-[clamp(.7rem,2.5vw,2.25rem)] font-semibold leading-tight">{th?content.customMade.body:"choose your own colour, size, stone or have a name engraved on the piece. each creation is made to order, especially for you."}</p>
   </div>
  </section>
  <section className="px-[5.4%] pb-[8%] pt-[1.5%]">
   <h2 className="mb-[5%] text-right text-[clamp(.85rem,2.78vw,2.5rem)] font-semibold">{th?"บางสิ่งที่เราจินตนาการไว้แล้ว":"a few things we've already imagined."}</h2>
   <p className="mb-[3%] text-[clamp(.65rem,1.67vw,1.5rem)] font-semibold">{th?"ค้นพบเครื่องประดับของเรา":"DISCOVER OUR JEWELRY"}</p>
   <div className="grid grid-cols-2 gap-x-[3%] gap-y-[6vw]">
    {features.flatMap(item=>{ const product=content.products.find(p=>p.id===item.id&&p.published); if(!product)return []; const original=editorialImage(product)!==product.image; return [<Link key={item.id} href={`/products/${item.id}`} className="group">
     <FigmaImage src={original?asset(item.image):product.image} alt={product.name} className="aspect-[624/349] rounded-[8px] transition-transform duration-700 group-hover:scale-[1.02]" crop={original?item.crop:undefined}/>
     <p className="mt-[4%] text-[clamp(.65rem,1.67vw,1.5rem)]">{product.name}</p>
    </Link>];})}
   </div>
   <p className="mt-[10%] text-[clamp(.6rem,1.39vw,1.25rem)]">{th?"สร้างสรรค์ด้วยมือ ด้วยความรักและความตั้งใจในกรุงเทพฯ":"handcrafted with love and intentions based in bangkok thailand"}</p>
  </section>
 </main>;
}
