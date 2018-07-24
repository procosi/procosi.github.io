const drawContent = function insertContent(contenido, nodo, nodoContenedor) {
  const narrative = document.getElementById('content');
  eContenido = contenido.replace(/\[\[/g, '<span class="tags" id=\"').replace(/\]\[/g, '\">').replace(/\]\]/g, '</span>');
  nodo.innerHTML = eContenido;
  if (nodoContenedor) {
    nodoContenedor.appendChild(nodo);
    narrative.appendChild(nodoContenedor);
  } else {
    narrative.appendChild(nodo);
  }
};

const drawNarrative = function insertNarrative(guia) {
  guia.forEach((e) => {
    eNode = document.createElement(e.t);
    if (e.class) {
      eNode.classList.add(e.class)
    };
    if (e.id) {
      eNode.id = e.id
    };
    if (e.t == 'ul'){
      e.c.forEach((li) => {
	eList = document.createElement('li');
	drawContent(li, eList, eNode);
      });
    } else if(e.class == 'reference') {
      refexplanation = document.createElement('span');
      refexplanation.classList.add('explanation')
      drawContent(e.c[0], refexplanation, eNode);
      ref = document.createElement('span');
      ref.classList.add('ref')
      drawContent(e.c[1], ref, eNode);
    } else {
      drawContent(e.c, eNode);
    }
  })
};

/*
 * Insert a circle of 'radius' radius made of 'n' svg circles, each of 'dot' radius, all positioned 'py' pixels down vertically
 */
const drawCircle = function insertCircle(n, radius, dot, py) {
  let nodes = [],
    angle,
    x,
    y,
    i,
    id;
  const width = (radius * 2) + 50,
    height = (radius * 2) + py;
  for (i = 1; i < n + 1; i++) {
    angle = (i / (n / 2)) * Math.PI;
    x = (radius * Math.cos(angle)) + (width / 2);
    y = (radius * Math.sin(angle)) + (height / 2);
    if (i < 41) { id = i + 14; } else { id = i - 40; }
    nodes.push({ id, x, y });
  }
  svg.selectAll('circle')
    .data(nodes)
    .enter()
    .append('circle')
    .attr('id', d => d.id)
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('r', dot)
    .append('title')
    .text(d => `Artículo ${d.id}`);
};

/*
 * Insert 'title' over an arc on top of the circle
 */
const circleTitle = function insertCircleTitle(title) {
  svg.append('path')
    .attr('id', 'arc')
    .attr('d', 'M 10,230 A 216,216 0 0,1 440,230');
  svg.append('text')
    .append('textPath')
    .attr('xlink:href', '#arc')
    .style('text-anchor', 'middle')
    .attr('startOffset', '50%')
    .attr('id', 'circletitle')
    .text(title);
};

/*
 * Insert 'summary' inside the circle, assuming it features a 'radius' radius, positioned 'py' pixels down vertically
 */
const circleText = function insertCircleText(summary, radius, py) {
  const side = 2 * radius * Math.cos(Math.PI / 4),
    midside = side * 0.90,
    dx = radius - side / 2 + 25,
    dy = radius - side / 2 + py;
  const g = svg.append('g')
    .attr('transform', `translate(${[dx, dy]})`);
  g.append('foreignObject')
    .attr('width', side)
    .attr('height', midside)
    .append('xhtml:body')
    .attr('xmlns', 'http://www.w3.org/1999/xhtml')
    .append('div')
    .append('p')
    .attr('id', 'onboard')
    .text(summary);
};

/*
 * Replace 'summary' inside the circle
 */
const changeCircleText = function changeCircleText(summary) {
  if (document.getElementById('onboard')) {
    document.getElementById('onboard').remove();
  } else {
    document.getElementById('circletext').remove();
  }
  const foreign = svg.selectAll('foreignObject body div');
  foreign.append('p')
    .attr('id', 'circletext')
    .attr('class', function(){
      if (summary.length < 12) {
	return "enlarge";
      } else if (summary.length > 270) {
	return "shrink";
      }
    })
    .text(summary);
};

const tagIndex = function indexTagsByArticle(tags) {
  tIndex = {};
  Object.entries(tags).forEach(([name, tag]) => {
    let n = tag.n;
    tag.a.forEach((art) => {
      if (!(art in tIndex)) {
	tIndex[art] = [];
      }
      if (tIndex[art].indexOf(n) < 0) {
	tIndex[art].push([name, n])
      };
    });
  });
  return tIndex;
};

/*
 * When the user clicks on an article dot, change its appearance and display the article associated with 'id'
 */
let lastSelected;
const articleDraw = function insertArticle(id, index, tags) {
  dot = document.getElementById(id);
  dot.classList.add('selected');
  if (lastSelected) { lastSelected.classList.remove('selected'); }
  const articleTitle = document.querySelector('#article h3');
  articleTitle.textContent = articles[id].t;
  const hr = document.querySelectorAll('#article hr');
  document.getElementById('articlesummary').remove()
  const articleSummary = document.createElement('div');
  articleSummary.id = 'articlesummary';
  articleSummary.textContent = articles[id].s;
  document.getElementById('article').insertBefore(articleSummary, document.querySelector('hr'));
  const asociaciones = document.getElementById('asociaciones');
  while (asociaciones.firstChild) {
    asociaciones.removeChild(asociaciones.firstChild);
  };
  asocIntro = document.createElement('p');
  asocIntro.id = 'asocintro'
  asocIntro.textContent = 'Este artículo se menciona en:';
  asociaciones.appendChild(asocIntro);
  asocontainer = document.createElement('ul');
  index.forEach((asociacion) => {
    asocli = document.createElement('li');
    asocspan = document.createElement('span');
    asocspan.textContent = asociacion[1];
    asocspan.classList.add('asociacion');
    let i = index.indexOf(asociacion);
    asocspan.addEventListener('mouseup', () => {summaryDraw(asociacion[0], tags, 1, i)});
    asocli.appendChild(asocspan);
    asocontainer.appendChild(asocli);
  });
  asociaciones.appendChild(asocontainer);
  
  const articleContent = document.getElementById('articlecontent');
  while (articleContent.firstChild) {
    articleContent.removeChild(articleContent.firstChild);
  }
  articles[id].c.forEach((p) => {
    const paragraph = document.createElement('div');
    if (p.prefix == 'none') {
      paragraph.classList.add('plain');
      paragraph.textContent = p.text;
      articleContent.appendChild(paragraph);
    } else {
      const prefixedParagraph = document.createElement('div');
      prefixedParagraph.classList.add('prefixedparagraph');
      const paragraphPrefix = document.createElement('div');
      paragraphPrefix.classList.add('prefix');
      paragraphPrefix.textContent = p.prefix;
      paragraph.classList.add('prefixed');
      paragraph.textContent = p.text;
      prefixedParagraph.appendChild(paragraphPrefix);
      prefixedParagraph.appendChild(paragraph);
      articleContent.appendChild(prefixedParagraph);
    }
  });
  if (hr[0].classList.length != 0){
    hr.forEach((separator) => {
      separator.classList.remove('nohr')
    });
  }
  lastSelected = dot;
};
const dotListener = function dotMouseListener(index, tags) {
  [...Array(54).keys()].forEach((id) => {
    (function () {
      id += 1;
      document.getElementById(id)
        .addEventListener('mouseup', () => { articleDraw(id, index[id], tags); }, false);
    }());
  });
};

/**
 * When the user clicks on a relevant passage, color the article dots and insert the summary associated with the passage 'id'
 */
let lastTagged = [];
let lastTarget;
let scrolled;
const summaryDraw = function insertSummary(id, tags, mobile, asoc) {
  if (lastTarget) {
    document.getElementById(lastTarget)
      .classList.remove('tagselection');
  }
  const target = document.getElementById(id);
  target.classList.add('tagselection');
  changeCircleText(tags[id].s);
  for (i = 0; i < lastTagged.length; i++) {
    dot = document.getElementById(lastTagged[i]);
    dot.classList.remove('tag');
  }
  articulos = tags[id].a;
  for (i = 0; i < articulos.length; i++) {
    dot = document.getElementById(articulos[i]);
    dot.classList.add('tag');
  }
  if (mobile == 1 && scrolled != 1){
    document.getElementById('circle').scrollIntoView({behavior: "smooth"});
    scrolled = 1;
  };
  let selected = document.querySelector('.asocselected');
  if (selected != null) {
    selected.classList.remove('asocselected');
  };
  if (asoc != undefined){
    document.getElementsByClassName('asociacion')[asoc].classList.add('asocselected');
  };
  lastTagged = articulos;
  lastTarget = id;
};
const tagListener = function tagMouseListener(tags, mobile) {
  tagTarget = document.querySelectorAll('.tags');
  tagTarget.forEach((target) => {
    (function () {
      const id = target.id;
      target.addEventListener('mouseup', () => { summaryDraw(id, tags, mobile); }, false);
    }());
  });
};

/*
 * Tasks to run when the screen is narrow
 */
const whenMobile = function tasksOnMobile(data) {
  // const tags = data.tags;
  // insertContent(data);
  circleWidth = (screen / 2) - ((screen / 450) * 40);
  drawCircle(54, circleWidth, 7.5, 50);
  circleText(instrucciones, circleWidth, 25);
  document.querySelector('#circle svg').style.height = `${screen * 0.95}px`;
  tagListener(data.asociaciones, 1);
};

/*
 * Tasks to run when the screen is wide
 */
const whenDesktop = function tasksOnDesktop(data) {
  // const tags = data.tags;
  // insertContent(data);
  drawCircle(54, 200, 6, 120);
  circleText(instrucciones, 200, 65);
  circleTitle('Convención sobre los Derechos de los Niños');
  drawNarrative(data.guia);
  tagListener(data.asociaciones, 0);
};

/*
 * Articles
 */
articles = {
  1: {
    t: 'Artículo 1',
    s: "Un niño es un ser humano menor a 18 años",
    c: [
      {
        prefix: 'none',
        text: 'Para los efectos de la presente Convención, se entiende por niño todo ser humano menor de dieciocho años de edad, salvo que, en virtud de la ley que le sea aplicable, haya alcanzado antes la mayoría de edad.',
      },
    ],
  },
  2: {
    t: 'Artículo 2',
    s: "El Estado asegura estos derechos a todos los niños en su jurisdicción. El Estado protege al niño de discriminación o castigo infringido a sus padres.",
    c: [
      {
        prefix: '1',
        text: 'Los Estados Partes respetarán los derechos enunciados en la presente Convención y asegurarán su aplicación a cada niño sujeto a su jurisdicción, sin distinción alguna, independientemente de la raza, el color, el sexo, el idioma, la religión, la opinión política o de otra índole, el origen nacional, étnico o social, la posición económica, los impedimentos físicos, el nacimiento o cualquier otra condición del niño, de sus padres o de sus representantes legales.',
      },
      {
        prefix: '2',
        text: 'Los Estados Partes tomarán todas las medidas apropiadas para garantizar que el niño se vea protegido contra toda forma de discriminación o castigo por causa de la condición, las actividades, las opiniones expresadas o las creencias de sus padres, o sus tutores o de sus familiares.',
      },
    ],
  },
  3: {
    t: 'Artículo 3',
    s: "Decisiones institucionales sobre niños deben priorizar el interés del niño. El Estado protege y resguarda el bienestar del niño considerando los derechos y deberes de padres. El Estado controla que instituciones encargadas de cuidar niños sean competentes y seguras.",
    c: [
      {
        prefix: '1',
        text: 'En todas las medidas concernientes a los niños que tomen las instituciones públicas o privadas de bienestar social, los tribunales, las autoridades administrativas o los órganos legislativos, una consideración primordial a que se atenderá será el interés superior del niño.',
      },
      {
        prefix: '2',
        text: 'Los Estados Partes se comprometen a asegurar al niño la protección y el cuidado que sean necesarios para su bienestar, teniendo en cuenta los derechos y deberes de sus padres, tutores u otras personas responsables de él ante la ley y, con ese fin, tomarán todas las medidas legislativas y administrativas adecuadas.',
      },
      {
        prefix: '3',
        text: 'Los Estados Partes se asegurarán de que las instituciones, servicios y establecimientos encargados del cuidado o la protección de los niños cumplan las normas establecidas por las autoridades competentes, especialmente en materia de seguridad, sanidad, número y competencia de su personal, así como en relación con la existencia de una supervisión adecuada.',
      },
    ],
  },
  4: {
    t: 'Artículo 4',
    s: "El Estado usará todos sus recursos para efectuar los derechos",
    c: [
      {
        prefix: 'none',
        text: 'Los Estados Partes adoptarán todas las medidas administrativas, legislativas y de otra índole para dar efectividad a los derechos reconocidos en la presente Convención. En lo que respecta a los derechos económicos, sociales y culturales, los Estados Partes adoptarán esas medidas hasta el máximo de los recursos de que dispongan y, cuando sea necesario, dentro del marco de la cooperación internacional.',
      },
    ],
  },
  5: {
    t: 'Artículo 5',
    s: "El Estado respeta las responsabilidades y derechos de padres para orientar al niño a ejercer sus derechos",
    c: [
      {
        prefix: 'none',
        text: 'Los Estados Partes respetarán las responsabilidades, los derechos y los deberes de los padres o, en su caso, de los miembros de la familia ampliada o de la comunidad, según establezca la costumbre local, de los tutores u otras personas encargadas legalmente del niño de impartirle, en consonancia con la evolución de sus facultades, dirección y orientación apropiadas para que el niño ejerza los derechos reconocidos en la presente Convención.',
      },
    ],
  },
  6: {
    t: 'Artículo 6',
    s: "El niño tiene derecho a la vida. El Estado garantiza la supervivencia y desarrollo del niño",
    c: [
      {
        prefix: '1',
        text: 'Los Estados Partes reconocen que todo niño tiene el derecho intrínseco a la vida.',
      },
      {
        prefix: '2',
        text: 'Los Estados Partes garantizarán en la máxima medida posible la supervivencia y el desarrollo del niño.',
      },
    ],
  },
  7: {
    t: 'Artículo 7',
    s: "El niño tiene derecho a un nombre, nacionalidad, a conocer y ser cuidado por sus padres. El Estado debe aplicar estos derechos.",
    c: [
      {
        prefix: '1',
        text: 'El niño será inscripto inmediatamente después de su nacimiento y tendrá derecho desde que nace a un nombre, a adquirir una nacionalidad y, en la medida de lo posible, a conocer a sus padres y a ser cuidado por ellos.',
      },
      {
        prefix: '2',
        text: 'Los Estados Partes velarán por la aplicación de estos derechos de conformidad con su legislación nacional y las obligaciones que hayan contraído en virtud de los instrumentos internacionales pertinentes en esta esfera, sobre todo cuando el niño resultara de otro modo apátrida.',
      },
    ],
  },
  8: {
    t: 'Artículo 8',
    s: "El niño tiene el derecho de preservar su nacionalidad, nombre y relaciones familiares. El Estado protege a niños que sean privados de este derecho y los asiste a restablecerlo.",
    c: [
      {
        prefix: '1',
        text: 'Los Estados Partes se comprometen a respetar el derecho del niño a preservar su identidad, incluidos la nacionalidad, el nombre y las relaciones familiares de conformidad con la ley sin injerencias ilícitas.',
      },
      {
        prefix: '2',
        text: 'Cuando un niño sea privado ilegalmente de algunos de los elementos de su identidad o de todos ellos, los Estados Partes deberán prestar la asistencia y protección apropiadas con miras a restablecer rápidamente su identidad.',
      },
    ],
  },
  9: {
    t: 'Artículo 9',
    s: "El niño no debe ser separado de sus padres, excepto cuando esté en su interés. Todas las partes interesadas podrán participar de la decisión de separación. El niño separado de sus padres tiene derecho de mantener relaciones con ellos, salvo que afecte su interés. Cuando el Estado decide unilateralmente la separación, debe informar a los familiares del separado, salvo que afecte el interés del niño.",
    c: [
      {
        prefix: '1',
        text: 'Los Estados Partes velarán por que el niño no sea separado de sus padres contra la voluntad de éstos, excepto cuando, a reserva de revisión judicial, las autoridades competentes determinen, de conformidad con la ley y los procedimientos aplicables, que tal separación es necesaria en el interés superior del niño. Tal determinación puede ser necesaria en casos particulares, por ejemplo, en los casos en que el niño sea objeto de maltrato o descuido por parte de sus padres o cuando éstos viven separados y debe adoptarse una decisión acerca del lugar de residencia del niño.',
      },
      {
        prefix: '2',
        text: 'En cualquier procedimiento entablado de conformidad con el párrafo 1 del presente artículo, se ofrecerá a todas las partes interesadas la oportunidad de participar en él y de dar a conocer sus opiniones.',
      },
      {
        prefix: '3',
        text: 'Los Estados Partes respetarán el derecho del niño que esté separado de uno o de ambos padres a mantener relaciones personales y contacto directo con ambos padres de modo regular, salvo si ello es contrario al interés superior del niño.',
      },
      {
        prefix: '4',
        text: 'Cuando esa separación sea resultado de una medida adoptada por un Estado Parte, como la detención, el encarcelamiento, el exilio, la deportación o la muerte (incluido el fallecimiento debido a cualquier causa mientras la persona esté bajo la custodia del Estado) de uno de los padres del niño, o de ambos, o del niño, el Estado Parte proporcionará, cuando se le pida, a los padres, al niño o, si procede, a otro familiar, información básica acerca del paradero del familiar o familiares ausentes, a no ser que ello resultase perjudicial para el bienestar del niño. Los Estados Partes se cerciorarán, además, de que la presentación de tal petición no entrañe por sí misma consecuencias desfavorables para la persona o personas interesadas.',
      },
    ],
  },
  10: {
    t: 'Artículo 10',
    s: "El Estado facilita la entrada o salida de padres o niños para reunirse. Niños separados de sus padres en otro país tienen el derecho de mantener relación y reunirse con ellos.",
    c: [
      {
        prefix: '1',
        text: 'De conformidad con la obligación que incumbe a los Estados Partes a tenor de lo dispuesto en el párrafo 1 del artículo 9, toda solicitud hecha por un niño o por sus padres para entrar en un Estado Parte o para salir de él a los efectos de la reunión de la familia será atendida por los Estados Partes de manera positiva, humanitaria y expeditiva. Los Estados Partes garantizarán, además, que la presentación de tal petición no traerá consecuencias desfavorables para los peticionarios ni para sus familiares. ',
      },
      {
        prefix: '2',
        text: 'El niño cuyos padres residan en Estados diferentes tendrá derecho a mantener periódicamente, salvo en circunstancias excepcionales, relaciones personales y contactos directos con ambos padres. Con tal fin, y de conformidad con la obligación asumida por los Estados Partes en virtud del párrafo 1 del artículo 9, los Estados Partes respetarán el derecho del niño y de sus padres a salir de cualquier país, incluido el propio, y de entrar en su propio país. El derecho de salir de cualquier país estará sujeto solamente a las restricciones estipuladas por ley y que sean necesarias para proteger la seguridad nacional, el orden público, la salud o la moral públicas o los derechos y libertades de otras personas y que estén en consonancia con los demás derechos reconocidos por la presente Convención.',
      },
    ],
  },
  11: {
    t: 'Artículo 11',
    s: "El Estado evita que niños sean trasladados y retenidos en el extranjero de forma ilícita. Los Estados firmarán acuerdos entre sí para este fin.",
    c: [
      {
        prefix: '1',
        text: 'Los Estados Partes adoptarán medidas para luchar contra los traslados ilícitos de niños al extranjero y la retención ilícita de niños en el extranjero.',
      },
      {
        prefix: '2',
        text: 'Para este fin, los Estados Partes promoverán la concertación de acuerdos bilaterales o multilaterales o la adhesión a acuerdos existentes.',
      },
    ],
  },
  12: {
    t: 'Artículo 12',
    s: "El Estado garantiza que el niño pueda formar y expresar su opinión en asuntos que lo afectan. El niño puede ser escuchado directa o indirectamente en asuntos del Estado que lo afectan.",
    c: [
      {
        prefix: '1',
        text: 'Los Estados Partes garantizarán al niño que esté en condiciones de formarse un juicio propio el derecho de expresar su opinión libremente en todos los asuntos que afectan al niño, teniéndose debidamente en cuenta las opiniones del niño, en función de la edad y madurez del niño.',
      },
      {
        prefix: '2',
        text: 'Con tal fin, se dará en particular al niño oportunidad de ser escuchado, en todo procedimiento judicial o administrativo que afecte al niño, ya sea directamente o por medio de un representante o de un órgano apropiado, en consonancia con las normas de procedimiento de la ley nacional.',
      },
    ],
  },
  13: {
    t: 'Artículo 13',
    s: "El niño puede buscar, recibir y difundir información de cualquier tipo y en cualquier medio. Este derecho puede ser limitado para respetar el derecho de otros o la seguridad nacional.",
    c: [
      {
        prefix: '1',
        text: 'El niño tendrá derecho a la libertad de expresión; ese derecho incluirá la libertad de buscar, recibir y difundir informaciones e ideas de todo tipo, sin consideración de fronteras, ya sea oralmente, por escrito o impresas, en forma artística o por cualquier otro medio elegido por el niño. ',
      },
      {
        prefix: '2',
        text: 'El ejercicio de tal derecho podrá estar sujeto a ciertas restricciones, que serán únicamente las que la ley prevea y sean necesarias: a) Para el respeto de los derechos o la reputación de los demás; o b) Para la protección de la seguridad nacional o el orden público o para proteger la salud o la moral públicas.',
      },
    ],
  },
  14: {
    t: 'Artículo 14',
    s: "El niño tiene libertad de pensamiento, conciencia y religión. El Estado respeta cómo los padres ayudan al niño a ejercer este derecho. Este derecho puede ser limitado para respetar el derecho de otros o la seguridad nacional.",
    c: [
      {
        prefix: '1',
        text: 'Los Estados Partes respetarán el derecho del niño a la libertad de pensamiento, de conciencia y de religión. ',
      },
      {
        prefix: '2',
        text: 'Los Estados Partes respetarán los derechos y deberes de los padres y, en su caso, de los representantes legales, de guiar al niño en el ejercicio de su derecho de modo conforme a la evolución de sus facultades.',
      },
      {
        prefix: '3',
        text: 'La libertad de profesar la propia religión o las propias creencias estará sujeta únicamente a las limitaciones prescritas por la ley que sean necesarias para proteger la seguridad, el orden, la moral o la salud públicos o los derechos y libertades fundamentales de los demás.',
      },
    ],
  },
  15: {
    t: 'Artículo 15',
    s: "El niño puede asociarse y celebrar reuniones pacíficas. Este derecho puede ser limitado para respetar el derecho de otros o la seguridad nacional.",
    c: [
      {
        prefix: '1',
        text: 'Los Estados Partes reconocen los derechos del niño a la libertad de asociación y a la libertad de celebrar reuniones pacíficas.',
      },
      {
        prefix: '2',
        text: 'No se impondrán restricciones al ejercicio de estos derechos distintas de las establecidas de conformidad con la ley y que sean necesarias en una sociedad democrática, en interés de la seguridad nacional o pública, el orden público, la protección de la salud y la moral públicas o la protección de los derechos y libertades de los demás.',
      },
    ],
  },
  16: {
    t: 'Artículo 16',
    s: "El niño es libre de injerencias a su privacidad o ataques a su honra ilegales. El Estado protege al niño.",
    c: [
      {
        prefix: '1',
        text: 'Ningún niño será objeto de injerencias arbitrarias o ilegales en su vida privada, su familia, su domicilio o su correspondencia ni de ataques ilegales a su honra y a su reputación.',
      },
      {
        prefix: '2',
        text: 'El niño tiene derecho a la protección de la ley contra esas injerencias o ataques.',
      },
    ],
  },
  17: {
    t: 'Artículo 17',
    s: "El Estado ayuda en la producción y difusión de información útil para el bienestar del niño.",
    c: [
      {
        prefix: 'none',
        text: 'Los Estados Partes reconocen la importante función que desempeñan los medios de comunicación y velarán por que el niño tenga acceso a información y material procedentes de diversas fuentes nacionales e internacionales, en especial la información y el material que tengan por finalidad promover su bienestar social, espiritual y moral y su salud física y mental. Con tal objeto, los Estados Partes:',
      },
      {
        prefix: 'a',
        text: 'Alentarán a los medios de comunicación a difundir información y materiales de interés social y cultural para el niño, de conformidad con el espíritu del artículo 29;',
      },
      {
        prefix: 'b',
        text: 'Promoverán la cooperación internacional en la producción, el intercambio y la difusión de esa información y esos materiales procedentes de diversas fuentes culturales, nacionales e internacionales;',
      },
      {
        prefix: 'c',
        text: 'Alentarán la producción y difusión de libros para niños;',
      },
      {
        prefix: 'd',
        text: 'Alentarán a los medios de comunicación a que tengan particularmente en cuenta las necesidades lingüísticas del niño perteneciente a un grupo minoritario o que sea indígena;',
      },
      {
        prefix: 'e',
        text: 'Promoverán la elaboración de directrices apropiadas para proteger al niño contra toda información y material perjudicial para su bienestar, teniendo en cuenta las disposiciones de los artículos 13 y 18.',
      },
    ],
  },
  18: {
    t: 'Artículo 18',
    s: "Ambos padres tienen la misma responsabilidad de desarrollo del niño. El Estado crea instituciones, instalaciones y servicios para que padres cumplan su responsabilidad. Niños cuyos padres trabajan pueden acceder a estos servicios.",
    c: [
      {
        prefix: '1',
        text: 'Los Estados Partes pondrán el máximo empeño en garantizar el reconocimiento del principio de que ambos padres tienen obligaciones comunes en lo que respecta a la crianza y el desarrollo del niño. Incumbirá a los padres o, en su caso, a los representantes legales la responsabilidad primordial de la crianza y el desarrollo del niño. Su preocupación fundamental será el interés superior del niño.',
      },
      {
        prefix: '2',
        text: 'A los efectos de garantizar y promover los derechos enunciados en la presente Convención, los Estados Partes prestarán la asistencia apropiada a los padres y a los representantes legales para el desempeño de sus funciones en lo que respecta a la crianza del niño y velarán por la creación de instituciones, instalaciones y servicios para el cuidado de los niños.',
      },
      {
        prefix: '3',
        text: 'Los Estados Partes adoptarán todas las medidas apropiadas para que los niños cuyos padres trabajan tengan derecho a beneficiarse de los servicios e instalaciones de guarda de niños para los que reúnan las condiciones requeridas.',
      },
    ],
  },
  19: {
    t: 'Artículo 19',
    s: "El Estado protege al niño de abusos físicos y mentales, tratos negligentes y explotativos. Esta protección incluye prevención e intervención judicial para casos de malos tratos.",
    c: [
      {
        prefix: '1',
        text: 'Los Estados Partes adoptarán todas las medidas legislativas, administrativas, sociales y educativas apropiadas para proteger al niño contra toda forma de perjuicio o abuso físico o mental, descuido o trato negligente, malos tratos o explotación, incluido el abuso sexual, mientras el niño se encuentre bajo la custodia de los padres, de un representante legal o de cualquier otra persona que lo tenga a su cargo.',
      },
      {
        prefix: '2',
        text: 'Esas medidas de protección deberían comprender, según corresponda, procedimientos eficaces para el establecimiento de programas sociales con objeto de proporcionar la asistencia necesaria al niño y a quienes cuidan de él, así como para otras formas de prevención y para la identificación, notificación, remisión a una institución, investigación, tratamiento y observación ulterior de los casos antes descritos de malos tratos al niño y, según corresponda, la intervención judicial.',
      },
    ],
  },
  20: {
    t: 'Artículo 20',
    s: "El Estado protege a niños sin familia. La forma de protección obedece leyes nacionales. La forma de protección prioriza la educación al niño y se conforma a su origen étnico, religioso, cultural y linguistico.",
    c: [
      {
        prefix: '1',
        text: 'Los niños temporal o permanentemente privados de su medio familiar, o cuyo superior interés exija que no permanezcan en ese medio, tendrán derecho a la protección y asistencia especiales del Estado.',
      },
      {
        prefix: '2',
        text: 'Los Estados Partes garantizarán, de conformidad con sus leyes nacionales, otros tipos de cuidado para esos niños.',
      },
      {
        prefix: '3',
        text: 'Entre esos cuidados figurarán, entre otras cosas, la colocación en hogares de guarda, la kafala del derecho islámico, la adopción o de ser necesario, la colocación en instituciones adecuadas de protección de menores. Al considerar las soluciones, se prestará particular atención a la conveniencia de que haya continuidad en la educación del niño y a su origen étnico, religioso, cultural y lingüístico.',
      },
    ],
  },
  21: {
    t: 'Artículo 21',
    s: "Adopciones serán autorizadas por autoridades competentes en un proceso legal que considere toda la información pertinente y el consentimiento de las personas interesadas. El niño puede acceder a adopciones en otro país y gozar de protecciones equivalentes a las del país de origen, sin generar beneficios financieros indebidos para personas involucradas.",
    c: [
      {
        prefix: 'none',
        text: 'Los Estados Partes que reconocen o permiten el sistema de adopción cuidarán de que el interés superior del niño sea la consideración primordial y:',
      },
      {
        prefix: 'a',
        text: 'Velarán por que la adopción del niño sólo sea autorizada por las autoridades competentes, las que determinarán, con arreglo a las leyes y a los procedimientos aplicables y sobre la base de toda la información pertinente y fidedigna, que la adopción es admisible en vista de la situación jurídica del niño en relación con sus padres, parientes y representantes legales y que, cuando así se requiera, las personas interesadas hayan dado con conocimiento de causa su consentimiento a la adopción sobre la base del asesoramiento que pueda ser necesario;',
      },
      {
        prefix: 'b',
        text: 'Reconocerán que la adopción en otro país puede ser considerada como otro medio de cuidar del niño, en el caso de que éste no pueda ser colocado en un hogar de guarda o entregado a una familia adoptiva o no pueda ser atendido de manera adecuada en el país de origen;',
      },
      {
        prefix: 'c',
        text: 'Velarán por que el niño que haya de ser adoptado en otro país goce de salvaguardias y normas equivalentes a las existentes respecto de la adopción en el país de origen;',
      },
      {
        prefix: 'd',
        text: 'Adoptarán todas las medidas apropiadas para garantizar que, en el caso de adopción en otro país, la colocación no dé lugar a beneficios financieros indebidos para quienes participan en ella;',
      },
      {
        prefix: 'e',
        text: 'Promoverán, cuando corresponda, los objetivos del presente artículo mediante la concertación de arreglos o acuerdos bilaterales o multilaterales y se esforzarán, dentro de este marco, por garantizar que la colocación del niño en otro país se efectúe por medio de las autoridades u organismos competentes.',
      },
    ],
  },
  22: {
    t: 'Artículo 22',
    s: "Niños considerados refugiados reciben protección y asistencia humanitaria. Los Estados cooperan en proteger y reunir niños refugiados con sus familias.",
    c: [
      {
        prefix: '1',
        text: 'Los Estados Partes adoptarán medidas adecuadas para lograr que el niño que trate de obtener el estatuto de refugiado o que sea considerado refugiado de conformidad con el derecho y los procedimientos internacionales o internos aplicables reciba, tanto si está solo como si está acompañado de sus padres o de cualquier otra persona, la protección y la asistencia humanitaria adecuadas para el disfrute de los derechos pertinentes enunciados en la presente Convención y en otros instrumentos internacionales de derechos humanos o de carácter humanitario en que dichos Estados sean partes.',
      },
      {
        prefix: '2',
        text: 'A tal efecto los Estados Partes cooperarán, en la forma que estimen apropiada, en todos los esfuerzos de las Naciones Unidas y demás organizaciones intergubernamentales competentes u organizaciones no gubernamentales que cooperen con las Naciones Unidas por proteger y ayudar a todo niño refugiado y localizar a sus padres o a otros miembros de su familia, a fin de obtener la información necesaria para que se reúna con su familia. En los casos en que no se pueda localizar a ninguno de los padres o miembros de la familia, se concederá al niño la misma protección que a cualquier otro niño privado permanente o temporalmente de su medio familiar, por cualquier motivo, como se dispone en la presente Convención.',
      },
    ],
  },
  23: {
    t: 'Artículo 23',
    s: "El niño física o mentalmente impedido disfruta de una vida plena y en condiciones dignas. El Estado asegurará la prestación de cuidados especiales a estos niños. Estos cuidados especiales serán otorgados, en lo posible, gratuitamente. Los Estados compartiran información que mejore su capacidad de ofrecer estos cuidados.",
    c: [
      {
        prefix: '1',
        text: 'Los Estados Partes reconocen que el niño mental o físicamente impedido deberá disfrutar de una vida plena y decente en condiciones que aseguren su dignidad, le permitan llegar a bastarse a sí mismo y faciliten la participación activa del niño en la comunidad.',
      },
      {
        prefix: '2',
        text: 'Los Estados Partes reconocen el derecho del niño impedido a recibir cuidados especiales y alentarán y asegurarán, con sujeción a los recursos disponibles, la prestación al niño que reúna las condiciones requeridas y a los responsables de su cuidado de la asistencia que se solicite y que sea adecuada al estado del niño y a las circunstancias de sus padres o de otras personas que cuiden de él.',
      },
      {
        prefix: '3',
        text: 'En atención a las necesidades especiales del niño impedido, la asistencia que se preste conforme al párrafo 2 del presente artículo será gratuita siempre que sea posible, habida cuenta de la situación económica de los padres o de las otras personas que cuiden del niño, y estará destinada a asegurar que el niño impedido tenga un acceso efectivo a la educación, la capacitación, los servicios sanitarios, los servicios de rehabilitación, la preparación para el empleo y las oportunidades de esparcimiento y reciba tales servicios con el objeto de que el niño logre la integración social y el desarrollo individual, incluido su desarrollo cultural y espiritual, en la máxima medida posible.',
      },
      {
        prefix: '4',
        text: 'Los Estados Partes promoverán, con espíritu de cooperación internacional, el intercambio de información adecuada en la esfera de la atención sanitaria preventiva y del tratamiento médico, psicológico y funcional de los niños impedidos, incluida la difusión de información sobre los métodos de rehabilitación y los servicios de enseñanza y formación profesional, así como el acceso a esa información a fin de que los Estados Partes puedan mejorar su capacidad y conocimientos y ampliar su experiencia en estas esferas. A este respecto, se tendrán especialmente en cuenta las necesidades de los países en desarrollo.',
      },
    ],
  },
  24: {
    t: 'Artículo 24',
    s: "El niño disfruta de servicios que le otorgan la mejor salud posible. El Estado reduce la mortalidad infantil, enfermedades y malnutrición mediante asistencia médica, atención sanitaria, en especial la atención primaria de salud, y la difusión de principios básicos de salud y nutrición para niños. El Estado abolirá prácticas tradicionales perjudiciales para la salud de niños. Los Estados cooperaran para realizar este derecho.",
    c: [
      {
        prefix: '1',
        text: 'Los Estados Partes reconocen el derecho del niño al disfrute del más alto nivel posible de salud y a servicios para el tratamiento de las enfermedades y la rehabilitación de la salud. Los Estados Partes se esforzarán por asegurar que ningún niño sea privado de su derecho al disfrute de esos servicios sanitarios.',
      },
      {
        prefix: '2',
        text: 'Los Estados Partes asegurarán la plena aplicación de este derecho y, en particular, adoptarán las medidas apropiadas para:',
      },
      {
        prefix: 'a',
        text: 'Reducir la mortalidad infantil y en la niñez;',
      },
      {
        prefix: 'b',
        text: 'Asegurar la prestación de la asistencia médica y la atención sanitaria que sean necesarias a todos los niños, haciendo hincapié en el desarrollo de la atención primaria de salud;',
      },
      {
        prefix: 'c',
        text: 'Combatir las enfermedades y la malnutrición en el marco de la atención primaria de la salud mediante, entre otras cosas, la aplicación de la tecnología disponible y el suministro de alimentos nutritivos adecuados y agua potable salubre, teniendo en cuenta los peligros y riesgos de contaminación del medio ambiente;',
      },
      {
        prefix: 'd',
        text: 'Asegurar atención sanitaria prenatal y postnatal apropiada a las madres;',
      },
      {
        prefix: 'e',
        text: 'Asegurar que todos los sectores de la sociedad, y en particular los padres y los niños, conozcan los principios básicos de la salud y la nutrición de los niños, las ventajas de la lactancia materna, la higiene y el saneamiento ambiental y las medidas de prevención de accidentes, tengan acceso a la educación pertinente y reciban apoyo en la aplicación de esos conocimientos;',
      },
      {
        prefix: 'f',
        text: 'Desarrollar la atención sanitaria preventiva, la orientación a los padres y la educación y servicios en materia de planificación de la familia.',
      },
      {
        prefix: '3',
        text: 'Los Estados Partes adoptarán todas las medidas eficaces y apropiadas posibles para abolir las prácticas tradicionales que sean perjudiciales para la salud de los niños.',
      },
      {
        prefix: '4',
        text: 'Los Estados Partes se comprometen a promover y alentar la cooperación internacional con miras a lograr progresivamente la plena realización del derecho reconocido en el presente artículo. A este respecto, se tendrán plenamente en cuenta las necesidades de los países en desarrollo.',
      },
    ],
  },
  25: {
    t: 'Artículo 25',
    s: "El niño internado por protección o tratamiento médico puede acceder a un examen periódico.",
    c: [
      {
        prefix: 'none',
        text: 'Los Estados Partes reconocen el derecho del niño que ha sido internado en un establecimiento por las autoridades competentes para los fines de atención, protección o tratamiento de su salud física o mental a un examen periódico del tratamiento a que esté sometido y de todas las demás circunstancias propias de su internación.',
      },
    ],
  },
  26: {
    t: 'Artículo 26',
    s: "Niños se benefician de la seguridad social. El Estado concede prestaciones para niños, tras considerar sus recursos y situación",
    c: [
      {
        prefix: '1',
        text: 'Los Estados Partes reconocerán a todos los niños el derecho a beneficiarse de la seguridad social, incluso del seguro social, y adoptarán las medidas necesarias para lograr la plena realización de este derecho de conformidad con su legislación nacional.',
      },
      {
        prefix: '2',
        text: 'Las prestaciones deberían concederse, cuando corresponda, teniendo en cuenta los recursos y la situación del niño y de las personas que sean responsables del mantenimiento del niño, así como cualquier otra consideración pertinente a una solicitud de prestaciones hecha por el niño o en su nombre.',
      },
    ],
  },
  27: {
    t: 'Artículo 27',
    s: "El niño posee un buen nivel de vida. Los padres son responsables de proveer este nivel de vida. El Estado ayuda materialmente a los padres, especialmente con respecto a nutrición, vestuario y vivienda. El Estado asegura que los padres paguen la pensión alimenticia, incluso si viven en el extranjero.",
    c: [
      {
        prefix: '1',
        text: 'Los Estados Partes reconocen el derecho de todo niño a un nivel de vida adecuado para su desarrollo físico, mental, espiritual, moral y social.',
      },
      {
        prefix: '2',
        text: 'A los padres u otras personas encargadas del niño les incumbe la responsabilidad primordial de proporcionar, dentro de sus posibilidades y medios económicos, las condiciones de vida que sean necesarias para el desarrollo del niño.',
      },
      {
        prefix: '3',
        text: 'Los Estados Partes, de acuerdo con las condiciones nacionales y con arreglo a sus medios, adoptarán medidas apropiadas para ayudar a los padres y a otras personas responsables por el niño a dar efectividad a este derecho y, en caso necesario, proporcionarán asistencia material y programas de apoyo, particularmente con respecto a la nutrición, el vestuario y la vivienda.',
      },
      {
        prefix: '4',
        text: 'Los Estados Partes tomarán todas las medidas apropiadas para asegurar el pago de la pensión alimenticia por parte de los padres u otras personas que tengan la responsabilidad financiera por el niño, tanto si viven en el Estado Parte como si viven en el extranjero. En particular, cuando la persona que tenga la responsabilidad financiera por el niño resida en un Estado diferente de aquel en que resida el niño, los Estados Partes promoverán la adhesión a los convenios internacionales o la concertación de dichos convenios, así como la concertación de cualesquiera otros arreglos apropiados.',
      },
    ],
  },
  28: {
    t: 'Artículo 28',
    s: "El niño accede a educación primaria, de manera obligatoria, secundaria y superior, además de información sobre cuestiones educacionales y profesionales, en un sistema que minimiza la deserción escolar. La administración de la disciplina escolar debe ser compatible con la dignidad humana del niño. Los Estados compartiran conocimientos técnicos y métodos de enseñanza.",
    c: [
      {
        prefix: '1',
        text: 'Los Estados Partes reconocen el derecho del niño a la educación y, a fin de que se pueda ejercer progresivamente y en condiciones de igualdad de oportunidades ese derecho, deberán en particular:',
      },
      {
        prefix: 'a',
        text: 'Implantar la enseñanza primaria obligatoria y gratuita para todos;',
      },
      {
        prefix: 'b',
        text: 'Fomentar el desarrollo, en sus distintas formas, de la enseñanza secundaria, incluida la enseñanza general y profesional, hacer que todos los niños dispongan de ella y tengan acceso a ella y adoptar medidas apropiadas tales como la implantación de la enseñanza gratuita y la concesión de asistencia financiera en caso de necesidad;',
      },
      {
        prefix: 'c',
        text: 'Hacer la enseñanza superior accesible a todos, sobre la base de la capacidad, por cuantos medios sean apropiados;',
      },
      {
        prefix: 'd',
        text: 'Hacer que todos los niños dispongan de información y orientación en cuestiones educacionales y profesionales y tengan acceso a ellas;',
      },
      {
        prefix: 'e',
        text: 'Adoptar medidas para fomentar la asistencia regular a las escuelas y reducir las tasas de deserción escolar.',
      },
      {
        prefix: '2',
        text: 'Los Estados Partes adoptarán cuantas medidas sean adecuadas para velar por que la disciplina escolar se administre de modo compatible con la dignidad humana del niño y de conformidad con la presente Convención.',
      },
      {
        prefix: '3',
        text: 'Los Estados Partes fomentarán y alentarán la cooperación internacional en cuestiones de educación, en particular a fin de contribuir a eliminar la ignorancia y el analfabetismo en todo el mundo y de facilitar el acceso a los conocimientos técnicos y a los métodos modernos de enseñanza. A este respecto, se tendrán especialmente en cuenta las necesidades de los países en desarrollo.',
      },
    ],
  },
  29: {
    t: 'Artículo 29',
    s: "La educación del niño desarrolla su personalidad, aptitudes y capacidades, le inculca respeto por los derechos de la Carta de las Naciones Unidas, el medio ambiente, sus padres y su identidad cultural así como la de otros, y lo prepara para una vida responsable en una sociedad libre. Las instituciones de enseñanza pueden decidir su propia dirección en tanto respeten los principios mencionados.",
    c: [
      {
        prefix: '1',
        text: 'Los Estados Partes convienen en que la educación del niño deberá estar encaminada a:',
      },
      {
        prefix: 'a',
        text: 'Desarrollar la personalidad, las aptitudes y la capacidad mental y física del niño hasta el máximo de sus posibilidades;',
      },
      {
        prefix: 'b',
        text: 'Inculcar al niño el respeto de los derechos humanos y las libertades fundamentales y de los principios consagrados en la Carta de las Naciones Unidas;',
      },
      {
        prefix: 'c',
        text: 'Inculcar al niño el respeto de sus padres, de su propia identidad cultural, de su idioma y sus valores, de los valores nacionales del país en que vive, del país de que sea originario y de las civilizaciones distintas de la suya;',
      },
      {
        prefix: 'd',
        text: 'Preparar al niño para asumir una vida responsable en una sociedad libre, con espíritu de comprensión, paz, tolerancia, igualdad de los sexos y amistad entre todos los pueblos, grupos étnicos, nacionales y religiosos y personas de origen indígena;',
      },
      {
        prefix: 'e',
        text: 'Inculcar al niño el respeto del medio ambiente natural.',
      },
      {
        prefix: '2',
        text: 'Nada de lo dispuesto en el presente artículo o en el artículo 28 se interpretará como una restricción de la libertad de los particulares y de las entidades para establecer y dirigir instituciones de enseñanza, a condición de que se respeten los principios enunciados en el párrafo 1 del presente artículo y de que la educación impartida en tales instituciones se ajuste a las normas mínimas que prescriba el Estado.',
      },
    ],
  },
  30: {
    t: 'Artículo 30',
    s: "Niños de grupos minoritarios pueden tener su propia cultura, religión o idioma.",
    c: [
      {
        prefix: 'none',
        text: 'En los Estados en que existan minorías étnicas, religiosas o lingüísticas o personas de origen indígena, no se negará a un niño que pertenezca a tales minorías o que sea indígena el derecho que le corresponde, en común con los demás miembros de su grupo, a tener su propia vida cultural, a profesar y practicar su propia religión, o a emplear su propio idioma.',
      },
    ],
  },
  31: {
    t: 'Artículo 31',
    s: "El niño puede descansar, esparcirse, jugar, participar de actividades recreativas, culturales y artísticas. El Estado promueve oportunidades para que niños ejerzan este derecho.",
    c: [
      {
        prefix: '1',
        text: 'Los Estados Partes reconocen el derecho del niño al descanso y el esparcimiento, al juego y a las actividades recreativas propias de su edad y a participar libremente en la vida cultural y en las artes.',
      },
      {
        prefix: '2',
        text: 'Los Estados Partes respetarán y promoverán el derecho del niño a participar plenamente en la vida cultural y artística y propiciarán oportunidades apropiadas, en condiciones de igualdad, de participar en la vida cultural, artística, recreativa y de esparcimiento.',
      },
    ],
  },
  32: {
    t: 'Artículo 32',
    s: "El Estado protege al niño de la explotación económica y trabajos que arriesguen su salud, desarrollo o educación. El Estado determina una edad mínima, horarios y condiciones de trabajo.",
    c: [
      {
        prefix: '1',
        text: 'Los Estados Partes reconocen el derecho del niño a estar protegido contra la explotación económica y contra el desempeño de cualquier trabajo que pueda ser peligroso o entorpecer su educación, o que sea nocivo para su salud o para su desarrollo físico, mental, espiritual, moral o social.',
      },
      {
        prefix: '2',
        text: 'Los Estados Partes adoptarán medidas legislativas, administrativas, sociales y educacionales para garantizar la aplicación del presente artículo. Con ese propósito y teniendo en cuenta las disposiciones pertinentes de otros instrumentos internacionales, los Estados Partes, en particular:',
      },
      {
        prefix: 'a',
        text: 'Fijarán una edad o edades mínimas para trabajar;',
      },
      {
        prefix: 'b',
        text: 'Dispondrán la reglamentación apropiada de los horarios y condiciones de trabajo;',
      },
      {
        prefix: 'c',
        text: 'Estipularán las penalidades u otras sanciones apropiadas para asegurar la aplicación efectiva del presente artículo.',
      },
    ],
  },
  33: {
    t: 'Artículo 33',
    s: "El Estado protege a los niños de la producción, tráfico y consumo de estupefacientes.",
    c: [
      {
        prefix: 'none',
        text: 'Los Estados Partes adoptarán todas las medidas apropiadas, incluidas medidas legislativas, administrativas, sociales y educacionales, para proteger a los niños contra el uso ilícito de los estupefacientes y sustancias sicotrópicas enumeradas en los tratados internacionales pertinentes, y para impedir que se utilice a niños en la producción y el tráfico ilícitos de esas sustancias.',
      },
    ],
  },
  34: {
    t: 'Artículo 34',
    s: "El Estado protege a los niños de explotación en prostitución, pornografía y otras prácticas sexuales ilegales.",
    c: [
      {
        prefix: 'none',
        text: 'Los Estados Partes se comprometen a proteger al niño contra todas las formas de explotación y abuso sexuales. Con este fin, los Estados Partes tomarán, en particular, todas las medidas de carácter nacional, bilateral y multilateral que sean necesarias para impedir:',
      },
      {
        prefix: 'a',
        text: 'La incitación o la coacción para que un niño se dedique a cualquier actividad sexual ilegal;',
      },
      {
        prefix: 'b',
        text: 'La explotación del niño en la prostitución u otras prácticas sexuales ilegales;',
      },
      {
        prefix: 'c',
        text: 'La explotación del niño en espectáculos o materiales pornográficos.',
      },
    ],
  },
  35: {
    t: 'Artículo 35',
    s: "El Estado protege a niños de secuestro, venta o trata.",
    c: [
      {
        prefix: 'none',
        text: 'Los Estados Partes tomarán todas las medidas de carácter nacional, bilateral y multilateral que sean necesarias para impedir el secuestro, la venta o la trata de niños para cualquier fin o en cualquier forma.',
      },
    ],
  },
  36: {
    t: 'Artículo 36',
    s: "El Estado protege a niños de otras formas de explotación.",
    c: [
      {
        prefix: 'none',
        text: 'Los Estados Partes protegerán al niño contra todas las demás formas de explotación que sean perjudiciales para cualquier aspecto de su bienestar.',
      },
    ],
  },
  37: {
    t: 'Artículo 37',
    s: "El niño no sufre torturas, tratos inhumanos, pena capital o prisión perpetua sin posibilidad de excarcelación. El niño puede ser legalmente privado de libertad como último recurso y por el menor tiempo posible, y por este periodo ser tratado dignamente, separado de adultos, en contacto con su familia y provisto de asistencia jurídica y derecho a impugnación.",
    c: [
      {
        prefix: 'none',
        text: 'Los Estados Partes velarán por que:',
      },
      {
        prefix: 'a',
        text: 'Ningún niño sea sometido a torturas ni a otros tratos o penas crueles, inhumanos o degradantes. No se impondrá la pena capital ni la de prisión perpetua sin posibilidad de excarcelación por delitos cometidos por menores de 18 años de edad;',
      },
      {
        prefix: 'b',
        text: 'Ningún niño sea privado de su libertad ilegal o arbitrariamente. La detención, el encarcelamiento o la prisión de un niño se llevará a cabo de conformidad con la ley y se utilizará tan sólo como medida de último recurso y durante el período más breve que proceda;',
      },
      {
        prefix: 'c',
        text: 'Todo niño privado de libertad sea tratado con la humanidad y el respeto que merece la dignidad inherente a la persona humana, y de manera que se tengan en cuenta las necesidades de las personas de su edad. En particular, todo niño privado de libertad estará separado de los adultos, a menos que ello se considere contrario al interés superior del niño, y tendrá derecho a mantener contacto con su familia por medio de correspondencia y de visitas, salvo en circunstancias excepcionales;',
      },
      {
        prefix: 'd',
        text: 'Todo niño privado de su libertad tendrá derecho a un pronto acceso a la asistencia jurídica y otra asistencia adecuada, así como derecho a impugnar la legalidad de la privación de su libertad ante un tribunal u otra autoridad competente, independiente e imparcial y a una pronta decisión sobre dicha acción.',
      },
    ],
  },
  38: {
    t: 'Artículo 38',
    s: "El Estado respeta normas del derecho internacional humanitario aplicables a niños en conflictos armados. El Estado asegura que menores de 15 años no participan en hostilidades. El Estado no recluta menores de 15 años. El Estado protege a niños afectados por un conflicto armado.",
    c: [
      {
        prefix: '1',
        text: 'Los Estados Partes se comprometen a respetar y velar por que se respeten las normas del derecho internacional humanitario que les sean aplicables en los conflictos armados y que sean pertinentes para el niño.',
      },
      {
        prefix: '2',
        text: 'Los Estados Partes adoptarán todas las medidas posibles para asegurar que las personas que aún no hayan cumplido los 15 años de edad no participen directamente en las hostilidades.',
      },
      {
        prefix: '3',
        text: 'Los Estados Partes se abstendrán de reclutar en las fuerzas armadas a las personas que no hayan cumplido los 15 años de edad. Si reclutan personas que hayan cumplido 15 años, pero que sean menores de 18, los Estados Partes procurarán dar prioridad a los de más edad.',
      },
      {
        prefix: '4',
        text: 'De conformidad con las obligaciones dimanadas del derecho internacional humanitario de proteger a la población civil durante los conflictos armados, los Estados Partes adoptarán todas las medidas posibles para asegurar la protección y el cuidado de los niños afectados por un conflicto armado.',
      },
    ],
  },
  39: {
    t: 'Artículo 39',
    s: "El Estado promueve la recuperación y reintegración social de niños víctimas de abandono, explotación, tortura u otros tratos inhumanos, o conflictos armados.",
    c: [
      {
        prefix: 'none',
        text: 'Los Estados Partes adoptarán todas las medidas apropiadas para promover la recuperación física y psicológica y la reintegración social de todo niño víctima de: cualquier forma de abandono, explotación o abuso; tortura u otra forma de tratos o penas crueles, inhumanos o degradantes; o conflictos armados. Esa recuperación y reintegración se llevarán a cabo en un ambiente que fomente la salud, el respeto de sí mismo y la dignidad del niño.',
      },
    ],
  },
  40: {
    t: 'Artículo 40',
    s: "El niño culpable de infringir leyes penales es tratado de manera digna, que fortalezca su respeto por los derechos de otros y lo ayude a reintegrarse a la sociedad. Un niño que es acusado de infringir una ley penal debe haber hecho algo prohibido por una ley, es presunto inocente, informado y asistido jurídicamente sin demora, no es obligado a prestar testimonio, pero puede obtener el interrogatorio de otros, es asistido linguisticamente de forma gratuita, se respeta su privacidad, y en caso de ser declarado culpable, esta decisión es sometida a una autoridad judicial superior. El Estado posee medidas especiales para niños acusados o declarados culpables de infringir leyes penales, incluyendo una edad mínima y medidas no judiciales. El Estado posee medidas para niños declarados culpables de infringir leyes penales que protegen su bienestar, como orientación, supervisión, asesoramiento, libertad vigilada, hogares de guarda y programas de enseñanza y formación profesional.",
    c: [
      {
        prefix: '1',
        text: 'Los Estados Partes reconocen el derecho de todo niño de quien se alegue que ha infringido las leyes penales o a quien se acuse o declare culpable de haber infringido esas leyes a ser tratado de manera acorde con el fomento de su sentido de la dignidad y el valor, que fortalezca el respeto del niño por los derechos humanos y las libertades fundamentales de terceros y en la que se tengan en cuenta la edad del niño y la importancia de promover la reintegración del niño y de que éste asuma una función constructiva en la sociedad.',
      },
      {
        prefix: '2',
        text: 'Con este fin, y habida cuenta de las disposiciones pertinentes de los instrumentos internacionales, los Estados Partes garantizarán, en particular:',
      },
      {
        prefix: 'a',
        text: 'Que no se alegue que ningún niño ha infringido las leyes penales, ni se acuse o declare culpable a ningún niño de haber infringido esas leyes, por actos u omisiones que no estaban prohibidos por las leyes nacionales o internacionales en el momento en que se cometieron;',
      },
      {
        prefix: 'b',
        text: 'Que a todo niño del que se alegue que ha infringido las leyes penales o a quien se acuse de haber infringido esas leyes se le garantice, por lo menos, lo siguiente:',
      },
      {
        prefix: 'i',
        text: 'Que se lo presumirá inocente mientras no se pruebe su culpabilidad conforme a la ley;',
      },
      {
        prefix: 'ii',
        text: 'Que será informado sin demora y directamente o, cuando sea procedente, por intermedio de sus padres o sus representantes legales, de los cargos que pesan contra él y que dispondrá de asistencia jurídica u otra asistencia apropiada en la preparación y presentación de su defensa;',
      },
      {
        prefix: 'iii',
        text: 'Que la causa será dirimida sin demora por una autoridad u órgano judicial competente, independiente e imparcial en una audiencia equitativa conforme a la ley, en presencia de un asesor jurídico u otro tipo de asesor adecuado y, a menos que se considerare que ello fuere contrario al interés superior del niño, teniendo en cuenta en particular su edad o situación y a sus padres o representantes legales;',
      },
      {
        prefix: 'iv',
        text: 'Que no será obligado a prestar testimonio o a declararse culpable, que podrá interrogar o hacer que se interrogue a testigos de cargo y obtener la participación y el interrogatorio de testigos de descargo en condiciones de igualdad;',
      },
      {
        prefix: 'v',
        text: 'Si se considerare que ha infringido, en efecto, las leyes penales, que esta decisión y toda medida impuesta a consecuencia de ella, serán sometidas a una autoridad u órgano judicial superior competente, independiente e imparcial, conforme a la ley;',
      },
      {
        prefix: 'vi',
        text: 'Que el niño contará con la asistencia gratuita de un intérprete si no comprende o no habla el idioma utilizado;',
      },
      {
        prefix: 'vii',
        text: 'Que se respetará plenamente su vida privada en todas las fases del procedimiento.',
      },
      {
        prefix: '3',
        text: 'Los Estados Partes tomarán todas las medidas apropiadas para promover el establecimiento de leyes, procedimientos, autoridades e instituciones específicos para los niños de quienes se alegue que han infringido las leyes penales o a quienes se acuse o declare culpables de haber infringido esas leyes, y en particular:',
      },
      {
        prefix: 'a',
        text: 'El establecimiento de una edad mínima antes de la cual se presumirá que los niños no tienen capacidad para infringir las leyes penales;',
      },
      {
        prefix: 'b',
        text: 'Siempre que sea apropiado y deseable, la adopción de medidas para tratar a esos niños sin recurrir a procedimientos judiciales, en el entendimiento de que se respetarán plenamente los derechos humanos y las garantías legales.',
      },
      {
        prefix: '4',
        text: 'Se dispondrá de diversas medidas, tales como el cuidado, las órdenes de orientación y supervisión, el asesoramiento, la libertad vigilada, la colocación en hogares de guarda, los programas de enseñanza y formación profesional, así como otras posibilidades alternativas a la internación en instituciones, para asegurar que los niños sean tratados de manera apropiada para su bienestar y que guarde proporción tanto con sus circunstancias como con la infracción.',
      },
    ],
  },
  41: {
    t: 'Artículo 41',
    s: "El Estado puede emplear disposiciones no descritas en la Convención que se encuentren en su derecho propio o el internacional y que promuevan mejor los derechos de niños.",
    c: [
      {
        prefix: 'none',
        text: 'Nada de lo dispuesto en la presente Convención afectará a las disposiciones que sean más conducentes a la realización de los derechos del niño y que puedan estar recogidas en:',
      },
      {
        prefix: 'a',
        text: 'El derecho de un Estado Parte; o',
      },
      {
        prefix: 'b',
        text: 'El derecho internacional vigente con respecto a dicho Estado.',
      },
    ],
  },
  42: {
    t: 'Artículo 42',
    s: "El Estado informará a niños y adultos de la Convención.",
    c: [
      {
        prefix: 'none',
        text: 'Los Estados Partes se comprometen a dar a conocer ampliamente los principios y disposiciones de la Convención por medios eficaces y apropiados, tanto a los adultos como a los niños.',
      },
    ],
  },
  43: {
    t: 'Artículo 43',
    s: "El Comité de los Derechos del Niño evaluará cómo los Estados cumplen la Convención. 18 expertos de los Estados Parte forman el Comité a título personal. La votación de los expertos será secreta. La votación ocurre cada 2 años y cada Estado puede presentar candidatos 4 meses antes. En la votación, dos tercios hacen quórum y los candidatos son elegidos por mayoría absoluta. Los miembros mandan por 4 años, excepto por 5 de ellos que son retirados tras 2 años por sorteo. Si un miembro dimite, el Estado del que proviene designa otro. El Comité adopta su propio reglamento. El Comité elige su Mesa por 2 años. Las reuniones del Comité ocurren cada año y su duración es revisada por los Estados Parte. El Secretario General de las Naciones Unidas proporciona el personal y servicios para el Comité. Los miembros reciben remuneración.",
    c: [
      {
        prefix: '1',
        text: 'Con la finalidad de examinar los progresos realizados en el cumplimiento de las obligaciones contraídas por los Estados Partes en la presente Convención, se establecerá un Comité de los Derechos del Niño que desempeñará las funciones que a continuación se estipulan.',
      },
      {
        prefix: '2',
        text: 'El Comité estará integrado por dieciocho expertos de gran integridad moral y reconocida competencia en las esferas reguladas por la presente Convención. Los miembros del Comité serán elegidos por los Estados Partes entre sus nacionales y ejercerán sus funciones a título personal, teniéndose debidamente en cuenta la distribución geográfica, así como los principales sistemas jurídicos.',
      },
      {
        prefix: '3',
        text: 'Los miembros del Comité serán elegidos, en votación secreta, de una lista de personas designadas por los Estados Partes. Cada Estado Parte podrá designar a una persona escogida entre sus propios nacionales.',
      },
      {
        prefix: '4',
        text: 'La elección inicial se celebrará a más tardar seis meses después de la entrada en vigor de la presente Convención y ulteriormente cada dos años. Con cuatro meses, como mínimo, de antelación respecto de la fecha de cada elección, el Secretario General de las Naciones Unidas dirigirá una carta a los Estados Partes invitándolos a que presenten sus candidaturas en un plazo de dos meses. El Secretario General preparará después una lista en la que figurarán por orden alfabético todos los candidatos propuestos, con indicación de los Estados Partes que los hayan designado, y la comunicará a los Estados Partes en la presente Convención.',
      },
      {
        prefix: '5',
        text: 'Las elecciones se celebrarán en una reunión de los Estados Partes convocada por el Secretario General en la Sede de las Naciones Unidas. En esa reunión, en la que la presencia de dos tercios de los Estados Partes constituirá quórum, las personas seleccionadas para formar parte del Comité serán aquellos candidatos que obtengan el mayor número de votos y una mayoría absoluta de los votos de los representantes de los Estados Partes presentes y votantes.',
      },
      {
        prefix: '6',
        text: 'Los miembros del Comité serán elegidos por un período de cuatro años. Podrán ser reelegidos si se presenta de nuevo su candidatura. El mandato de cinco de los miembros elegidos en la primera elección expirará al cabo de dos años; inmediatamente después de efectuada la primera elección, el presidente de la reunión en que ésta se celebre elegirá por sorteo los nombres de esos cinco miembros.',
      },
      {
        prefix: '7',
        text: 'Si un miembro del Comité fallece o dimite o declara que por cualquier otra causa no puede seguir desempeñando sus funciones en el Comité, el Estado Parte que propuso a ese miembro designará entre sus propios nacionales a otro experto para ejercer el mandato hasta su término, a reserva de la aprobación del Comité.',
      },
      {
        prefix: '8',
        text: 'El Comité adoptará su propio reglamento.',
      },
      {
        prefix: '9',
        text: 'El Comité elegirá su Mesa por un período de dos años.',
      },
      {
        prefix: '10',
        text: 'Las reuniones del Comité se celebrarán normalmente en la Sede de las Naciones Unidas o en cualquier otro lugar conveniente que determine el Comité. El Comité se reunirá normalmente todos los años. La duración de las reuniones del Comité será determinada y revisada, si procediera, por una reunión de los Estados Partes en la presente Convención, a reserva de la aprobación de la Asamblea General.',
      },
      {
        prefix: '11',
        text: 'El Secretario General de las Naciones Unidas proporcionará el personal y los servicios necesarios para el desempeño eficaz de las funciones del Comité establecido en virtud de la presente Convención.',
      },
      {
        prefix: '12',
        text: 'Previa aprobación de la Asamblea General, los miembros del Comité establecido en virtud de la presente Convención recibirán emolumentos con cargo a los fondos de las Naciones Unidas, según las condiciones que la Asamblea pueda establecer.',
      },
    ],
  },
  44: {
    t: 'Artículo 44',
    s: "El Estado da un informe cada 5 años al Comité sobre medidas y progreso en derechos de niños. El informe indica circunstancias y dificultades que enfrenta el Estado. El Estado no necesita repetir la información básica del informe inicial en informes posteriores. El Comité puede pedir más información a los Estados. El Comité presenta un informe a la Asamblea General de las Naciones Unidas cada dos años. El Estado difunde su informe públicamente.",
    c: [
      {
        prefix: '1',
        text: 'Los Estados Partes se comprometen a presentar al Comité, por conducto del Secretario General de las Naciones Unidas, informes sobre las medidas que hayan adoptado para dar efecto a los derechos reconocidos en la Convención y sobre el progreso que hayan realizado en cuanto al goce de esos derechos:',
      },
      {
        prefix: 'a',
        text: 'En el plazo de dos años a partir de la fecha en la que para cada Estado Parte haya entrado en vigor la presente Convención;',
      },
      {
        prefix: 'b',
        text: 'En lo sucesivo, cada cinco años.',
      },
      {
        prefix: '2',
        text: 'Los informes preparados en virtud del presente artículo deberán indicar las circunstancias y dificultades, si las hubiere, que afecten al grado de cumplimiento de las obligaciones derivadas de la presente Convención. Deberán asimismo, contener información suficiente para que el Comité tenga cabal comprensión de la aplicación de la Convención en el país de que se trate.',
      },
      {
        prefix: '3',
        text: 'Los Estados Partes que hayan presentado un informe inicial completo al Comité no necesitan repetir, en sucesivos informes presentados de conformidad con lo dispuesto en el inciso b) del párrafo 1 del presente artículo, la información básica presentada anteriormente.',
      },
      {
        prefix: '4',
        text: 'El Comité podrá pedir a los Estados Partes más información relativa a la aplicación de la Convención.',
      },
      {
        prefix: '5',
        text: 'El Comité presentará cada dos años a la Asamblea General de las Naciones Unidas, por conducto del Consejo Económico y Social, informes sobre sus actividades.',
      },
      {
        prefix: '6',
        text: 'Los Estados Partes darán a sus informes una amplia difusión entre el público de sus países respectivos.',
      },
    ],
  },
  45: {
    t: 'Artículo 45',
    s: "Los organismos especializados, el Fondo de las Naciones Unidas para la Infancia y otros órganos de las Naciones Unidas pueden asesorar la aplicación de la Convención por iniciativa propia o invitación del Comité y serán comunicados de informes de Estados que soliciten su asistencia técnica. El Comité puede recomendar estudios a la Asamblea General y formular recomendaciones a los Estados.",
    c: [
      {
        prefix: 'none',
        text: 'Con objeto de fomentar la aplicación efectiva de la Convención y de estimular la cooperación internacional en la esfera regulada por la Convención:',
      },
      {
        prefix: 'a',
        text: 'Los organismos especializados, el Fondo de las Naciones Unidas para la Infancia y demás órganos de las Naciones Unidas tendrán derecho a estar representados en el examen de la aplicación de aquellas disposiciones de la presente Convención comprendidas en el ámbito de su mandato. El Comité podrá invitar a los organismos especializados, al Fondo de las Naciones Unidas para la Infancia y a otros órganos competentes que considere apropiados a que proporcionen asesoramiento especializado sobre la aplicación de la Convención en los sectores que son de incumbencia de sus respectivos mandatos. El Comité podrá invitar a los organismos especializados, al Fondo de las Naciones Unidas para la Infancia y demás órganos de las Naciones Unidas a que presenten informes sobre la aplicación de aquellas disposiciones de la presente Convención comprendidas en el ámbito de sus actividades;',
      },
      {
        prefix: 'b',
        text: 'El Comité transmitirá, según estime conveniente, a los organismos especializados, al Fondo de las Naciones Unidas para la Infancia y a otros órganos competentes, los informes de los Estados Partes que contengan una solicitud de asesoramiento o de asistencia técnica, o en los que se indique esa necesidad, junto con las observaciones y sugerencias del Comité, si las hubiere, acerca de esas solicitudes o indicaciones;',
      },
      {
        prefix: 'c',
        text: 'El Comité podrá recomendar a la Asamblea General que pida al Secretario General que efectúe, en su nombre, estudios sobre cuestiones concretas relativas a los derechos del niño;',
      },
      {
        prefix: 'd',
        text: 'El Comité podrá formular sugerencias y recomendaciones generales basadas en la información recibida en virtud de los artículos 44 y 45 de la presente Convención. Dichas sugerencias y recomendaciones generales deberán transmitirse a los Estados Partes interesados y notificarse a la Asamblea General, junto con los comentarios, si los hubiere, de los Estados Partes.',
      },
    ],
  },
  46: {
    t: 'Artículo 46',
    s: "Todos los Estados pueden firmar la Convención",
    c: [
      {
        prefix: 'none',
        text: 'La presente Convención estará abierta a la firma de todos los Estados.',
      },
    ],
  },
  47: {
    t: 'Artículo 47',
    s: "El Secretario General de las Naciones Unidas puede ratificar la Convención.",
    c: [
      {
        prefix: 'none',
        text: 'La presente Convención está sujeta a ratificación. Los instrumentos de ratificación se depositarán en poder del Secretario General de las Naciones Unidas.',
      },
    ],
  },
  48: {
    t: 'Artículo 48',
    s: "Todos los Estados pueden adherirse a la Convención.",
    c: [
      {
        prefix: 'none',
        text: 'La presente Convención permanecerá abierta a la adhesión de cualquier Estado. Los instrumentos de adhesión se depositarán en poder del Secretario General de las Naciones Unidas.',
      },
    ],
  },
  49: {
    t: 'Artículo 49',
    s: "La Convención entra en vigor 30 días después de que 20 Estados se hayan adherido a ella o ratificado. Para otros Estados, la Convención entra en vigor 30 días después de haberse adherido a ella o ratificado.",
    c: [
      {
        prefix: '1',
        text: 'La presente Convención entrará en vigor el trigésimo día siguiente a la fecha en que haya sido depositado el vigésimo instrumento de ratificación o de adhesión en poder del Secretario General de las Naciones Unidas.',
      },
      {
        prefix: '2',
        text: 'Para cada Estado que ratifique la Convención o se adhiera a ella después de haber sido depositado el vigésimo instrumento de ratificación o de adhesión, la Convención entrará en vigor el trigésimo día después del depósito por tal Estado de su instrumento de ratificación o adhesión.',
      },
    ],
  },
  50: {
    t: 'Artículo 50',
    s: "El Estado puede proponer una enmienda mediante el Secretario General de las Naciones Unidas quien, luego de que un tercio de los Estados Partes acuerde discutirla en menos de 4 meses, convoca a una conferencia. La enmienda entra en vigor si es aprobada por dos tercios de los Estados Partes y la Asamblea General de las Naciones Unidas. La enmienda sólo entra en vigor para los Estados que la hayan aprobado.",
    c: [
      {
        prefix: '1',
        text: 'Todo Estado Parte podrá proponer una enmienda y depositarla en poder del Secretario General de las Naciones Unidas. El Secretario General comunicará la enmienda propuesta a los Estados Partes, pidiéndoles que les notifiquen si desean que se convoque una conferencia de Estados Partes con el fin de examinar la propuesta y someterla a votación. Si dentro de los cuatro meses siguientes a la fecha de esa notificación un tercio, al menos, de los Estados Partes se declara en favor de tal conferencia, el Secretario General convocará una conferencia con el auspicio de las Naciones Unidas. Toda enmienda adoptada por la mayoría de Estados Partes, presentes y votantes en la conferencia, será sometida por el Secretario General a la Asamblea General de las Naciones Unidas para su aprobación.',
      },
      {
        prefix: '2',
        text: 'Toda enmienda adoptada de conformidad con el párrafo 1 del presente artículo entrará en vigor cuando haya sido aprobada por la Asamblea General de las Naciones Unidas y aceptada por una mayoría de dos tercios de los Estados Partes.',
      },
      {
        prefix: '3',
        text: 'Cuando las enmiendas entren en vigor serán obligatorias para los Estados Partes que las hayan aceptado, en tanto que los demás Estados Partes seguirán obligados por las disposiciones de la presente Convención y por las enmiendas anteriores que hayan aceptado.',
      },
    ],
  },
  51: {
    t: 'Artículo 51',
    s: "El Estado comunica reservas mediante el Secretario General de las Naciones Unidas. Una reserva debe ser compatible con el objeto y propósito de la Convención. El Estado puede retirar reservas mediante el Secretario General de las Naciones Unidas.",
    c: [
      {
        prefix: '1',
        text: 'El Secretario General de las Naciones Unidas recibirá y comunicará a todos los Estados el texto de las reservas formuladas por los Estados en el momento de la ratificación o de la adhesión.',
      },
      {
        prefix: '2',
        text: 'No se aceptará ninguna reserva incompatible con el objeto y el propósito de la presente Convención.',
      },
      {
        prefix: '3',
        text: 'Toda reserva podrá ser retirada en cualquier momento por medio de una notificación hecha a ese efecto y dirigida al Secretario General de las Naciones Unidas, quien informará a todos los Estados. Esa notificación surtirá efecto en la fecha de su recepción por el Secretario General.',
      },
    ],
  },
  52: {
    t: 'Artículo 52',
    s: "El Estado puede comunicar denuncias a la Convención mediante el Secretario General de las Naciones Unidas, que se hacen efectivas 1 año después.",
    c: [
      {
        prefix: 'none',
        text: 'Todo Estado Parte podrá denunciar la presente Convención mediante notificación hecha por escrito al Secretario General de las Naciones Unidas. La denuncia surtirá efecto un año después de la fecha en que la notificación haya sido recibida por el Secretario General.',
      },
    ],
  },
  53: {
    t: 'Artículo 53',
    s: "El Secretario General de las Naciones Unidas es depositario de la Convención.",
    c: [
      {
        prefix: 'none',
        text: 'Se desgina depositario de la presente Convención al Secretario General de las Naciones Unidas.',
      },
    ],
  },
  54: {
    t: 'Artículo 54',
    s: "El Secretario General de las Naciones Unidas es depositario del original de la Convención.",
    c: [
      {
        prefix: 'none',
        text: 'El original de la presente Convención, cuyos textos en árabe, chino, español, francés, inglés y ruso son igualmente auténticos, se depositará en poder del Secretario General de las Naciones Unidas.',
      },
      {
        prefix: 'none',
        text: 'EN TESTIMONIO DE LO CUAL, los infrascritos plenipotenciarios, debidamente autorizados para ello por sus respectivos gobiernos, han firmado la presente Convención.',
      },
    ],
  },
};

/*
 * Run everything
 */

const svg = d3.selectAll('#circle svg'),
      screen = window.screen.width,
      instrucciones = 'Cada uno de estos puntos es un artículo de la Convención. Puedes explorarlos haciendo click en cada uno o a través de los enlaces en el texto, que represetan colecciones de artículos.';

fetch('./data/narrativa.json').then(function(response) {
  response.json().then(function(json) {
    if (screen < 460) {
      whenMobile(json);
    } else {
      whenDesktop(json);
    }
    const index = tagIndex(json.asociaciones);
    dotListener(index, json.asociaciones);
  })
});
