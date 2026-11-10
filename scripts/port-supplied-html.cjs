// One-time source presentation adaptation; API, credentials and mock catalog are never imported.
const fs=require('node:fs'),{spawnSync}=require('node:child_process');
function patchLines(file,transform){
  const lines=fs.readFileSync(file,'utf8').split('\n');const changes=[];
  for(const line of lines){const updated=transform(line);if(updated!==line){if(line.length>10000)throw new Error('Refusing to patch embedded model data');changes.push(`@@\n-${line}\n+${updated}`);}}
  if(!changes.length)return;
  const result=spawnSync('apply_patch',[`*** Begin Patch\n*** Update File: ${file}\n${changes.join('\n')}\n*** End Patch`],{encoding:'utf8'});
  if(result.status!==0)throw new Error(result.stderr||result.stdout);
  console.log(result.stdout.trim());
}
for(const name of fs.readdirSync('public/custom-made/builder').filter(name=>name.endsWith('.html'))){
  patchLines(`public/custom-made/builder/${name}`,line=>{
    let updated=line.replace('>add to cart</button>','>request quote</button>').replace("note.textContent = 'added to your bag.';","note.textContent = 'Review the enquiry form below, then submit it to the store.';").replace('to add it to your bag.','to request a quote.').replace('saved. the order sheet in “details describe” is ready to send to the workshop.','Saved in this browser only. Request a quote below to send your design to the store.').replace(/\$[0-9][0-9,.]*/g,'Quote required');
    if(updated.includes('localStorage.setItem'))updated=updated.replace("catch (e) {}","catch (e) { $('note').hidden = false; $('note').textContent = 'Unable to save in this browser. Please copy your order sheet instead.'; return; }");
    return updated;
  });
}
const source=process.argv[2];
if(source){
  const file='app/help/page.tsx',old=fs.readFileSync(file,'utf8');
  let page=fs.readFileSync(`${source}/app/help/page.js`,'utf8');
  page=page.replace('import ContactForm from "../../components/ContactForm";',`import Link from 'next/link';\nimport { HelpContactForm } from '../components/HelpContactForm';\nimport { JewelryCareCopy } from '../components/JewelryCareCopy';`);
  page=page.replace('<section className="help-page text-page">','<main className="supplied-ui"><section className="help-page text-page">').replace('    </section>\n  );','    </section></main>\n  );');
  page=page.replace('id="after-sale"','id="after-sales"').replace('<h3 className="center">returns</h3>','<h3 id="returns" className="center">returns</h3>');
  page=page.replace('<p>line @valleydarley</p>','<p><a href="https://line.me/R/ti/p/@valleydarley" target="_blank" rel="noopener noreferrer">line @valleydarley ↗</a></p>');
  page=page.replace('are shown at checkout. enjoy free international shipping on orders over 300 USD.','are shown at checkout. Online checkout currently supports Thailand delivery. For international delivery, please contact us for a quote.');
  page=page.replace('a tracking number will be sent to you for every order once it has been shipped. you can follow it on our <a className="link" href="/track">track your order</a> page.','Your tracking details appear in <Link href="/orders" className="link">My orders</Link> after shipment. You can also use our <Link href="/track" className="link">track your order</Link> page.');
  page=page.replace(/<div className="help-care">[\s\S]*?<\/div>/,'<div className="help-care native-ui space-y-8"><JewelryCareCopy /></div>');
  page=page.replace('<div className="help-news">\n        <h2>sign up for our newsletter</h2>\n        <ContactForm />','<section id="ring-size"><h2 className="script-title center">A guide for the Ring</h2><img className="size-guide-img" src="/assets/ui/size-guide-ring.png" alt="Ring size chart and measuring instructions" /></section>\n      <div id="newsletter" className="help-news"><div className="native-ui supplied-contact-form"><HelpContactForm /></div>');
  const patch='*** Begin Patch\n*** Update File: '+file+'\n@@\n'+old.trimEnd().split('\n').map(line=>'-'+line).join('\n')+'\n'+page.trimEnd().split('\n').map(line=>'+'+line).join('\n')+'\n*** End Patch';
  const result=spawnSync('apply_patch',[patch],{encoding:'utf8'});if(result.status!==0)throw new Error(result.stderr||result.stdout);console.log(result.stdout.trim());
}
