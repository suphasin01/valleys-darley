import Link from "next/link";
import { FigmaImage } from "../components/FigmaImage";
import { getLocale } from "../lib/locale";
export const dynamic="force-dynamic";
const asset=(id:number)=>`/images/figma/about-${id}.webp`;
const meaning="valleydarley comes from valley's darling — a valley beloved by us, and by someone like you. in that world, anything is possible. we are here to hold that space, and to remind you that you already know the way. you will find your own valley.";
export default async function About(){
 const th=(await getLocale())==="th";
 return <main className="editorial-page overflow-hidden bg-white text-black">
  <section className="relative px-[4.65%] pt-[4.8%]">
   <FigmaImage src={asset(0)} className="absolute inset-x-0 top-0 aspect-[1452/275] opacity-75" crop={{width:"186.65%",height:"619.41%",left:"-24.41%",top:"-3.26%"}}/>
   <div className="relative ml-auto mb-[4%] w-[70%] text-right">
    <h1 className="brand-script text-[clamp(2rem,6.67vw,6rem)] leading-tight">{th?"เข้าสู่โลกของเรา":"Enter our World"}</h1>
    <p className="mt-[5%] text-[clamp(.75rem,1.39vw,1.25rem)] leading-relaxed">{th?"เรื่องราวของเราเริ่มขึ้นในปี 2020 จากความโรแมนติกและความรักในภาพถ่ายฟิล์มเก่า เราถ่ายทอดความรู้สึกนี้ลงในภาพและเครื่องประดับทุกชิ้น อ่อนหวานและเป็นผู้หญิง พร้อมความสนุกเล็ก ๆ":"our story began in 2020, with the warm romance that lives in a young girl's heart and a love for the mood of old film photographs and days gone by. We wanted to pour this feeling into every image and every piece of our jewelry. Each piece is soft and feminine, with a touch of playfulness — where sweetness meets a little edge."}</p>
   </div>
   <FigmaImage src={asset(1)} alt="Handcrafted jewelry worn by a woman resting beside a wooden chest" className="aspect-[1294/650] rounded-[8px]" crop={{width:"101.33%",height:"149.96%",left:"-1.33%",top:"-16.89%"}}/>
   <p className="mx-auto my-[7%] max-w-[74%] text-center text-[clamp(.75rem,1.39vw,1.25rem)] leading-relaxed">{th?"หัวใจของเราคือจินตนาการและงานฝีมือที่ใส่ใจ เพื่อให้เครื่องประดับทุกชิ้นมีชีวิต และทำให้คุณรู้สึกดีทุกครั้งที่สวมใส่":<>at our core, we are a blend of creative imagination and careful handcraft, brought together to breathe life into everything we make.<br/><br/>for us, it&apos;s all about how a piece makes you feel when you wear it.</>}</p>
  </section>
  <section className="mx-auto grid w-[85%] grid-cols-1 gap-8 pb-[10%] md:grid-cols-2 md:gap-[12%]">
   <div><h2 className="brand-script text-[clamp(2.5rem,6.67vw,6rem)] leading-[.9]">{th?"ความหมายเบื้องหลังชื่อของเรา":<>The Meaning<br/>behind our name</>}</h2>
    <p className="mt-10 text-[clamp(.85rem,1.67vw,1.5rem)] leading-[1.4]">{th?"Valley’s Darling คือหุบเขาที่เรารัก และใครบางคนเช่นคุณก็รัก ในโลกใบนั้นทุกสิ่งเป็นไปได้ เราอยู่ตรงนี้เพื่อรักษาพื้นที่แห่งจินตนาการนั้น และเตือนว่าคุณรู้อยู่แล้วว่าจะค้นพบหุบเขาของตัวเองได้อย่างไร":meaning}</p>
    <p className="mt-8 text-[clamp(.85rem,1.67vw,1.5rem)] leading-[1.4]">{th?"ระยะทางระหว่างความฝันและสิ่งที่คุณถืออยู่ในมือ จินตนาการนำทาง งานฝีมือตามมา":"that is what valley's darling is: the distance between a dream and the thing you hold. imagination leads."}</p>
    <p className="mt-16 text-[clamp(.85rem,1.67vw,1.5rem)]">{th?"สิ่งที่มาถึงมือคุณ เริ่มต้นจากที่ซึ่งหัวใจเท่านั้นที่เข้าถึง":"craft follows. what arrives in your hands began somewhere only the heart can reach."}</p>
   </div>
   <FigmaImage src={asset(2)} alt="A romantic illustration of a woman in an imagined valley" className="aspect-[631/773]"/>
  </section>
  <section className="relative mx-auto w-[82%]">
   <FigmaImage src={asset(4)} alt="Mother of pearl rosette ring worn beside a pearl necklace" className="aspect-[1178/1622]" crop={{width:"135.27%",height:"130.85%",left:"-20.99%",top:"-13.63%"}}/>
   <h2 className="absolute right-0 top-[6%] w-[42%] rotate-[5.73deg] text-[clamp(1.2rem,5.56vw,5rem)] leading-none text-white">“keepsakes of wonder and romance”</h2>
  </section>
  <p className="mx-auto w-[32%] min-w-[240px] py-[6%] text-[clamp(.8rem,1.67vw,1.5rem)] leading-[1.4]">{th?"จินตนาการนำทางให้ชิ้นงานที่เป็นเอกลักษณ์ของคุณ เกิดขึ้นจริงในมือ":"valleydarley comes from valley's darling — a valley beloved by us, and by someone like you. in that world, anything is possible. we are here to hold that space, and to remind you that you already know the way. you will find your own valley."}</p>
  <section className="bg-[#f1e9eb] pb-[4%]">
   <h2 className="brand-script border-y border-black/20 px-[7%] py-5 text-[clamp(2.5rem,6.67vw,6rem)]">{th?"บรรจุภัณฑ์ของเรา":"The Packaging"}</h2>
   <p className="w-[65%] px-[6%] py-[5%] text-[clamp(.8rem,1.67vw,1.5rem)] leading-tight">{th?"เราทำถุงเครื่องประดับด้วยมือ เลือกวัสดุและผ้าคุณภาพดีให้เข้ากับแต่ละคอลเลกชัน เพื่อห่อหุ้มและปกป้องเครื่องประดับของคุณ":"we handcraft our own jewelry pouches using different materials to match the style of each collection. We only use premium fabrics to make sure your jewelry is both beautifully wrapped and well-protected"}</p>
   <div className="mx-[1.25%] aspect-[1402/474] bg-[#d9d9d9]" aria-label={th?"พื้นที่ภาพบรรจุภัณฑ์ตามแบบ":"Packaging image placeholder from the original design"}/>
   <p className="ml-auto w-[38%] px-5 py-4 text-right text-[clamp(.75rem,1.67vw,1.5rem)]">{th?"ทุกรายละเอียดตั้งแต่ตัวเครื่องประดับจนถึงบรรจุภัณฑ์ สร้างด้วยมือและความตั้งใจ":"that’s why everything from the jewelry itself to the final detail on our packaging—is handcrafted with intention."}</p>
   <FigmaImage src={asset(3)} alt="Where to find us" className="mx-auto aspect-[354/263] w-[25%]" crop={{width:"271.05%",height:"455.62%",left:"-86.32%",top:"-298.32%"}}/>
   <div className="text-center"><Link href="/contact" className="figma-cta bg-white">{th?"ติดต่อเรา":"contact us"}</Link></div>
  </section>
 </main>;
}
