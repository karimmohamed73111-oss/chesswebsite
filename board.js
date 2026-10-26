/* A precise, dependency-free product illustration for the live chess set preview. */
(function () {
  'use strict';
  let serial = 0;

  const finishes = {
    walnut: { rim: '#765037', edge: '#4c3325', side: '#62412d', light: '#ddc7a6', dark: '#816047', rimLight: '#a37b52' },
    oak: { rim: '#b69a70', edge: '#89734e', side: '#9f855d', light: '#eddfc2', dark: '#b29b73', rimLight: '#d7c29d' },
    midnight: { rim: '#3a433e', edge: '#202823', side: '#2d352f', light: '#d3d7c7', dark: '#566456', rimLight: '#6d796a' }
  };
  const colours = {
    ivory: ['#fff7df', '#e6d4ad', '#b6a07d'],
    sage: ['#ced5bb', '#a0ae8c', '#66785e'],
    terracotta: ['#e6b393', '#be8165', '#8c5140']
  };
  const escape = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const point = (u, v) => [400 + (u - v) * 35.7, 161 + (u + v) * 16.9];
  const pts = points => points.map(p => p.map(n => n.toFixed(2)).join(',')).join(' ');

  function classic(type, fill, stroke) {
    const shape = d => `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width=".65" stroke-linejoin="round"/>`;
    const base = shape('M-21 0 Q-24-4-21-8 L-17-12 Q-19-15-15-18 L15-18 Q19-15 17-12 L21-8 Q24-4 21 0 Q0 8-21 0Z');
    const collar = shape('M-13-23 Q-17-25-13-28 L13-28 Q17-25 13-23Z');
    let body = '';
    if (type === 'pawn') {
      body = shape('M-13-17 Q-9-22-8-29 L-5-39 L5-39 L8-29 Q9-22 13-17Z') + shape('M-10-39 Q-13-42-9-45 L9-45 Q13-42 10-39Z') + `<circle cx="0" cy="-53" r="10" fill="${fill}" stroke="${stroke}" stroke-width=".65"/>`;
    } else if (type === 'rook') {
      body = shape('M-14-18 Q-9-24-9-31 L-9-48 L9-48 L9-31 Q9-24 14-18Z') + shape('M-14-48 L-16-54 L-16-67 L-9-67 L-9-61 L-3-61 L-3-68 L3-68 L3-61 L9-61 L9-67 L16-67 L16-54 L14-48Z') + shape('M-14-45 L14-45 L14-49 L-14-49Z');
    } else if (type === 'knight') {
      body = shape('M-15-18 Q-12-27-13-34 Q-13-43-7-49 L-14-50 Q-17-54-13-58 L-4-65 L-3-72 L3-69 Q14-67 17-55 Q21-44 17-31 L13-18Z') + `<path d="M-7-49 Q2-51 5-59 M11-58 Q17-44 9-31" fill="none" stroke="${stroke}" stroke-width="1.4" opacity=".6"/><circle cx="1" cy="-62" r="1.5" fill="${stroke}"/>`;
    } else if (type === 'bishop') {
      body = shape('M-15-18 Q-8-25-7-39 L-9-48 L9-48 L7-39 Q8-25 15-18Z') + collar + shape('M0-77 Q-3-69-9-62 Q-16-51-6-46 Q0-43 6-46 Q16-51 9-62 Q3-69 0-77Z') + `<path d="M1-70 L-6-55" stroke="${stroke}" stroke-width="2" opacity=".7"/>`;
    } else if (type === 'queen') {
      body = shape('M-15-18 Q-9-27-8-44 L-11-55 L11-55 L8-44 Q9-27 15-18Z') + collar + shape('M-11-55 L-17-76 L-7-68 L0-81 L7-68 L17-76 L11-55Z') + shape('M-13-55 Q0-51 13-55 L13-60 Q0-56-13-60Z') + [-17,0,17].map((x,i)=>`<circle cx="${x}" cy="${i===1?-81:-76}" r="2.9" fill="${fill}" stroke="${stroke}" stroke-width=".5"/>`).join('');
    } else {
      body = shape('M-15-18 Q-9-27-8-47 L-12-58 L12-58 L8-47 Q9-27 15-18Z') + collar + shape('M-12-58 L-15-72 Q0-67 15-72 L12-58Z') + shape('M-3-70 L-3-80 L-10-80 L-10-86 L-3-86 L-3-93 L3-93 L3-86 L10-86 L10-80 L3-80 L3-70Z');
    }
    return base + body + '<path d="M-18-5 Q0 1 18-5" fill="none" stroke="#fff" stroke-width="1" opacity=".2"/>';
  }

  function modern(type, fill, stroke) {
    const shape = d => `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width=".7" stroke-linejoin="round"/>`;
    const base = shape('M-20 0 L-20-8 Q0-14 20-8 L20 0 Q0 8-20 0Z') + `<ellipse cx="0" cy="-8" rx="20" ry="5.6" fill="${fill}" stroke="${stroke}" stroke-width=".5"/>`;
    let body = '';
    if(type==='pawn') body=shape('M-11-8 L-7-37 L7-37 L11-8 Q0-3-11-8Z')+`<circle cx="0" cy="-47" r="10" fill="${fill}" stroke="${stroke}" stroke-width=".6"/>`;
    if(type==='rook') body=shape('M-13-8 L-12-57 L12-57 L13-8 Q0-3-13-8Z')+shape('M-16-56 L-16-70 L-8-70 L-8-64 L-3-64 L-3-71 L3-71 L3-64 L8-64 L8-70 L16-70 L16-56Z');
    if(type==='knight') body=shape('M-14-8 L-12-38 L-5-52 L-14-50 L-17-56 L0-70 L3-78 L9-72 L14-67 L14-8 Q0-3-14-8Z')+`<circle cx="3" cy="-65" r="1.5" fill="${stroke}"/><path d="M9-60 L4-48 L1-15" fill="none" stroke="${stroke}" stroke-width="1" opacity=".4"/>`;
    if(type==='bishop') body=shape('M-13-8 L-8-47 L8-47 L13-8 Q0-3-13-8Z')+shape('M0-81 L13-62 L8-47 L-8-47 L-13-62Z')+`<path d="M3-75 L-5-59" stroke="${stroke}" stroke-width="2"/>`;
    if(type==='queen') body=shape('M-14-8 L-9-54 L9-54 L14-8 Q0-3-14-8Z')+shape('M-9-54 L-17-78 L-6-69 L0-83 L6-69 L17-78 L9-54Z');
    if(type==='king') body=shape('M-14-8 L-9-68 L9-68 L14-8 Q0-3-14-8Z')+shape('M-3-68 L-3-79 L-11-79 L-11-86 L-3-86 L-3-94 L3-94 L3-86 L11-86 L11-79 L3-79 L3-68Z');
    return base+body+'<path d="M-10-14 L-6-43" stroke="#fff" stroke-width="1.2" opacity=".17"/>';
  }

  function geometric(type, fill, stroke) {
    const shape = d => `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width=".7" stroke-linejoin="round"/>`;
    const base = shape('M-21-4 L-14-13 L14-13 L21-4 L16 3 L-16 3Z');
    const facet = '<path d="M0-13 L0-48 L12-13Z" fill="#000" opacity=".06"/>';
    let body='';
    if(type==='pawn') body=shape('M-12-13 L-5-38 L5-38 L12-13Z')+`<circle cx="0" cy="-47" r="9" fill="${fill}" stroke="${stroke}" stroke-width=".6"/>`;
    if(type==='rook') body=shape('M-13-13 L-13-69 L-5-69 L-5-60 L5-60 L5-69 L13-69 L13-13Z');
    if(type==='knight') body=shape('M-14-13 L-12-41 L-3-53 L-15-51 L-18-59 L0-72 L5-79 L12-68 L16-13Z')+`<circle cx="1" cy="-64" r="1.4" fill="${stroke}"/>`;
    if(type==='bishop') body=shape('M-14-13 L0-80 L14-13Z')+`<path d="M3-66 L-4-52" stroke="${stroke}" stroke-width="2"/>`;
    if(type==='queen') body=shape('M-14-13 L-9-55 L-17-79 L-6-70 L0-86 L6-70 L17-79 L9-55 L14-13Z');
    if(type==='king') body=shape('M-14-13 L-5-71 L-5-79 L-12-79 L-12-86 L-4-86 L-4-94 L4-94 L4-86 L12-86 L12-79 L5-79 L5-71 L14-13Z');
    return base+body+facet;
  }

  function render(element, options = {}) {
    if (!element) return;
    const id = 'chess-product-' + (++serial);
    const finish = finishes[options.finish] || finishes.walnut;
    const coloursLight = colours[options.pieceColour] || colours.ivory;
    const maker = options.style === 'modern' ? modern : options.style === 'geometric' ? geometric : classic;
    const corner = [point(-.43,-.43), point(8.43,-.43),point(8.43,8.43),point(-.43,8.43)];
    const lower = corner.map(([x,y])=>[x,y+22]);
    let cells='';
    for(let v=0;v<8;v++) for(let u=0;u<8;u++) {
      cells+=`<polygon points="${pts([point(u,v),point(u+1,v),point(u+1,v+1),point(u,v+1)])}" fill="${(u+v)%2 ? finish.dark : finish.light}"/>`;
    }
    let grain='';
    for(let n=0;n<28;n++){
      const v=n*8/28;
      grain+=`<path d="M${point(0,v).join(' ')} Q${point(4,v+.04).join(' ')} ${point(8,v).join(' ')}" fill="none" stroke="#2f2217" stroke-width="${n%3===0?.65:.3}" opacity="${n%3===0?.08:.05}"/>`;
    }
    const back=['rook','knight','bishop','queen','king','bishop','knight','rook'];
    const pieces=[];
    [0,1,6,7].forEach(v=>{for(let u=0;u<8;u++){
      const x=options.rotated?7-u:u, y=options.rotated?7-v:v;
      pieces.push({u:x,v:y,type:v===0||v===7?back[u]:'pawn',dark:v<2});
    }});
    pieces.sort((a,b)=>(a.u+a.v)-(b.u+b.v)||a.u-b.u);
    const pieceMarkup=pieces.map(piece=>{
      const [x,y]=point(piece.u+.5,piece.v+.5);
      const fill=`url(#${id}-${piece.dark?'black':'white'})`;
      const stroke=piece.dark?'#33291f':coloursLight[2];
      return `<g data-piece="${piece.type}" transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(.77)"><ellipse cx="3" cy="3" rx="24" ry="7" fill="#211d17" opacity=".17"/>${maker(piece.type,fill,stroke)}</g>`;
    }).join('');
    const engraving=String(options.engraving||'').trim().slice(0,30);
    const label=`${options.finish||'walnut'} chessboard with ${options.style||'classic'} ${options.pieceColour||'ivory'} and dark pieces${engraving?', engraved '+engraving:''}`;
    element.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 560" role="img" aria-label="${escape(label)}" style="display:block;width:100%;height:auto;overflow:visible">
      <defs>
        <linearGradient id="${id}-white" x1="-23" y1="0" x2="22" y2="0" gradientUnits="userSpaceOnUse"><stop stop-color="${coloursLight[2]}"/><stop offset=".23" stop-color="${coloursLight[1]}"/><stop offset=".44" stop-color="${coloursLight[0]}"/><stop offset=".7" stop-color="${coloursLight[1]}"/><stop offset="1" stop-color="${coloursLight[2]}"/></linearGradient>
        <linearGradient id="${id}-black" x1="-23" y1="0" x2="22" y2="0" gradientUnits="userSpaceOnUse"><stop stop-color="#342a20"/><stop offset=".23" stop-color="#634a36"/><stop offset=".44" stop-color="#8d7050"/><stop offset=".7" stop-color="#58422e"/><stop offset="1" stop-color="#30271e"/></linearGradient>
        <linearGradient id="${id}-rim" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="${finish.rimLight}"/><stop offset="1" stop-color="${finish.rim}"/></linearGradient>
        <filter id="${id}-shadow" x="-.3" y="-.6" width="1.6" height="2.2"><feGaussianBlur stdDeviation="13"/></filter>
      </defs>
      <ellipse cx="400" cy="425" rx="284" ry="48" fill="#534230" opacity=".13" filter="url(#${id}-shadow)"/>
      <polygon points="${pts([corner[1],corner[2],lower[2],lower[1]])}" fill="${finish.edge}"/>
      <polygon points="${pts([corner[2],corner[3],lower[3],lower[2]])}" fill="${finish.side}"/>
      <polygon points="${pts(corner)}" fill="url(#${id}-rim)" stroke="${finish.edge}" stroke-width="1"/>
      <polygon points="${pts([point(-.1,-.1),point(8.1,-.1),point(8.1,8.1),point(-.1,8.1)])}" fill="none" stroke="${finish.rimLight}" stroke-width="1" opacity=".65"/>
      ${cells}${grain}
      <path d="M${corner[3].join(' ')} L${corner[2].join(' ')} L${corner[1].join(' ')}" fill="none" stroke="${finish.rimLight}" stroke-width="1.5" opacity=".6"/>
      ${pieceMarkup}
      ${engraving?`<text x="245" y="385" transform="rotate(25.33 245 385)" text-anchor="middle" dominant-baseline="middle" font-family="Georgia,serif" font-size="11" letter-spacing="1.2" fill="${options.finish==='oak'?'#5c4930':'#d1b993'}">${escape(engraving)}</text>`:''}
    </svg>`;
  }
  window.ChessBoard={render};
})();
