const plating=['18k Gold plated','Rhodium plated'];
const finish=['High Polish','Matte'];
const length=['45-50 cm','40-45 cm','37-42 cm'];
export type StudioPiece={key:string;id:string;name:string;file:string;image:string;options:Record<string,string[]>};
export const studioPieces:StudioPiece[] = [
  {key:'locket',id:'heart-locket',name:'Custom Ruffle Heart Locket Necklace',file:'02_Ruffle_Heart_Locket_Necklace.html',image:'/custom-made/img/locket_24.webp',options:{plating,gemstone:['Aquamarine','Pink Tourmaline'],finish,'star gemstone':['Sapphire','Yellow sapphire'],length,engraving:['No engraving','Add engraving']}},
  {key:'swirl',id:'swirl-bow',name:'Custom Classic Swirl Bow Necklace',file:'03_Swirl_Bow_Necklace.html',image:'/custom-made/img/swirl_00.webp',options:{plating,gemstone:['Aquamarine','Green Amethyst'],finish,length}},
  {key:'earrings',id:'ribbon-earring',name:'Custom Pleated Gemstone Ribbon Earrings',file:'04_Pleated_Gemstone_Earrings.html',image:'/custom-made/img/earrings_00.webp',options:{plating,gemstone:['White (emerald cut)','Light Pink (emerald cut)','Blue (crushed ice)'],finish}},
  {key:'ring',id:'pearl-ring',name:'Custom Rosette Ribbon Ring',file:'01_Ruffle_Ring.html',image:'/custom-made/img/ring_00.webp',options:{plating,gemstone:['White pearl','Pink pearl','Purple pearl'],finish,size:['US 5','US 6','US 7','US 8','US 9']}},
];
export function studioPiece(id:string) {return studioPieces.find(piece=>piece.id===id || piece.key===id);}
export function validateStudioSelection(piece:StudioPiece,value:unknown):Record<string,string>|null {
  if (!value || typeof value!=='object' || Array.isArray(value)) return null;
  const options=value as Record<string,unknown>, result:Record<string,string>={};
  const fields=piece.options;
  for(const [key,allowed] of Object.entries(fields)) {
    if(typeof options[key]!=='string' || !allowed.includes(options[key] as string)) return null;
    result[key]=options[key] as string;
  }
  if(Object.keys(options).some(key=>!(key in fields) && !['engraving font','engraving text','notes'].includes(key))) return null;
  if(piece.key==='locket' && options.engraving==='Add engraving') {
    const text=typeof options['engraving text']==='string' ? options['engraving text'].trim() : '';
    const font=options['engraving font'];
    if(!text || text.replace(/\s/g,'').length>40 || text.length>160 || /[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(text) || typeof font!=='string' || !['La Graziela','ED Lavonia','Cormorant SC','Young Serif'].includes(font)) return null;
    result['engraving text']=text;result['engraving font']=font;
  } else if(options['engraving text'] || options['engraving font']) return null;
  if(options.notes!==undefined) {if(typeof options.notes!=='string' || options.notes.length>300)return null;result.notes=options.notes.trim();}
  return result;
}
export function studioSummary(piece:StudioPiece,options:Record<string,string>) {
  return `${piece.name}\n${Object.entries(options).map(([key,value])=>`${key}: ${value}`).join('\n')}\n\nCustom design enquiry. Final price and availability require confirmation by the store.`;
}
