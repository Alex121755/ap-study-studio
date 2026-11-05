import type { LessonMap } from './types';

/**
 * Original, offline teaching notes and original practice passages (not official exam items).
 * Framework checked 2026-11-02 against College Board's current course descriptions:
 * https://apcentral.collegeboard.org/media/pdf/ap-world-history-modern-course-and-exam-description-effective-fall-2026.pdf
 * https://apcentral.collegeboard.org/media/pdf/ap-english-language-and-composition-course-and-exam-description.pdf
 * Historical case checks (museum, archive, treaty and institutional sources):
 * https://www.metmuseum.org/es/essays/the-trans-saharan-gold-trade-7th-14th-century
 * https://www.metmuseum.org/ko/exhibitions/sahel-art-empire-sahara/inside-the-exhibition
 * https://www.metmuseum.org/de/essays/the-art-of-the-ottomans-before-1600
 * https://www.nms.ac.uk/discover-catalogue/the-newcomen-engine-and-its-role-in-britains-industrial-revolution
 * https://historicengland.org.uk/content/docs/education/explorer/teachers-kit-steam-power-pdf/
 * https://history.state.gov/milestones/1784-1800/haitian-rev
 * https://www.nam.ac.uk/explore/why-did-indian-mutiny-happen
 * https://www.parliament.uk/about/living-heritage/evolutionofparliament/legislativescrutiny/parliament-and-empire/parliament-and-the-american-colonies-before-1765/east-india-company-and-raj-1785-1858/
 * https://www.iwm.org.uk/history/first-world-war/outbreak
 * https://www.un.org/dppa/decolonization/en/node/644
 * https://ozone.unep.org/treaties/montreal-protocol
 * These lessons cover the map's selected nodes, not every point in the official curriculum.
 */
export const worldElcLessons: LessonMap = {
  'world-states': {
    objectives: ['用行政制度、合法性和地方社会三个维度比较政权。', '解释信仰如何帮助统治，同时指出它不能自动统一社会。'],
    sections: [
      { title: '从“相信什么”走到“怎样统治”', body: 'c.1200–1450 的国家并非只靠军队。南宋延续儒家经典教育和科举选官，形成文官治理的理想；这能为皇权提供道德语言，也为地方精英提供入仕通道。但应试需要资源，不能据此推断人人享有平等机会。' },
      { title: '同一宗教，可以有不同政治作用', body: '马里统治者借助伊斯兰联系跨撒哈拉商人和学者。曼萨·穆萨 1324 年赴麦加朝觐，展示财富并扩大对外联系；王室信仰并不等于所有居民立即改宗。比较时应看中央与地方如何合作、征税和维护权威，不能用一个宗教标签代替制度。' },
    ],
    keyPoints: [
      { label: '官僚制 bureaucracy', explanation: '由有分工的官员执行征税、司法等事务；它能扩大中央治理范围，也需要财政支持。' },
      { label: '统治合法性 legitimacy', explanation: '人们认为统治有正当理由的依据，例如儒家道德理想、宗教赞助或王朝传统。' },
      { label: '宗教网络', explanation: '商人、学者与朝圣者跨越政治边界；马里通过伊斯兰网络加强交流。' },
      { label: '地方差异', explanation: '统治者采用某种信仰，不表示地方习俗、社会等级或其他宗教消失。' },
    ],
    example: { title: '把两个事实写成比较', question: '南宋科举与曼萨·穆萨的朝觐，怎样体现两种建立权威的方法？', walkthrough: '共同维度是“权威如何得到支持”。科举把经典教育与行政人才连接；朝觐把宗教身份、财富展示与跨区域联系连接。两者都借助信仰或价值体系，但具体机制不同。', answer: '两者都利用文化信念支持统治；南宋主要把儒家教育嵌入选官制度，马里王室则以伊斯兰赞助和朝觐强化声望及国际联系。该比较不意味着马里不存在行政机构。' },
    misconceptions: [
      { claim: '有科举，所以南宋是现代民主国家。', correction: '科举涉及选官渠道，并不赋予公民普遍选举权；皇权和社会资源差异仍然重要。' },
      { claim: '马里国王信奉伊斯兰，所以全体居民都信奉伊斯兰。', correction: '王室、商人和地方生产者的宗教实践可以不同，改宗并非同步完成。' },
    ],
    checks: [
      { question: '“国家修建宗教建筑”属于权威的哪一种机制？', answer: '宗教赞助与公共展示：建筑把统治者同神圣秩序、资源动员能力联系起来。' },
      { question: '比较两国时只分别列出宗教名称，缺了什么？', answer: '共同维度和解释：这些信念具体怎样影响选官、税收、身份或统治正当性。' },
    ],
    nextStep: '任选德里苏丹国或东南亚一个政权，补一项制度证据，再用同一维度与南宋比较。',
  },
  'world-networks': {
    objectives: ['分别解释丝路、印度洋和跨撒哈拉贸易扩张的条件。', '把商品流动与文化、疾病传播区分并连接。'],
    sections: [
      { title: '网络需要运输，也需要信任', body: '丝路的商队和驿站有助于接力运输，蒙古统治在部分时期促进跨区域通行；印度洋商人利用可预测的季风安排往返；跨撒哈拉商队依靠骆驼及绿洲路线。技术降低运输限制，信用、商人社群和政权保护则降低交易风险。' },
      { title: '后果并不只是一笔交易', body: '商人定居形成侨民社群，宗教与语言随人员交流传播。例如东非斯瓦希里港口连接非洲内陆与印度洋世界。病原体也沿交通和人口流动扩散，十四世纪黑死病说明互联可以放大危机；这不表示每条路线的结果或受益者相同。' },
    ],
    keyPoints: [
      { label: '季风 monsoon', explanation: '具有季节变化的风系；水手利用其规律安排航程，而非全年沿同一方向顺风航行。' },
      { label: '商业信用', explanation: '使商人不必全程携带等值现金的支付与借贷安排，扩大交易的可能规模。' },
      { label: '侨民社群 diaspora', explanation: '迁入港口的商人保留部分身份、同时与当地社会互动，可成为语言和交易中介。' },
      { label: '条件与后果', explanation: '骆驼适应沙漠是运输条件；贸易城镇发展和宗教交流是可能的后果。' },
    ],
    example: { title: '沿一条路线解释因果', question: '为什么不能把“印度洋贸易增长，因为伊斯兰传播”当作完整解释？', walkthrough: '先拆开作用环节：季风与船舶支持大宗运输；港口和商人关系支持交易。共同宗教有时帮助建立商业联系，贸易本身也促进宗教传播，存在双向影响。', answer: '更完整的论证是：航海知识使跨海运输可行，商业社群帮助交易持续，商人的定居又促进伊斯兰传播。宗教网络既可能促进贸易，也可能因贸易而扩大。' },
    misconceptions: [
      { claim: '丝绸之路是一条由同一批商人走到底的道路。', correction: '它是多条陆路构成的网络，商品常经多次转手，贸易距离不等于每个商人的旅行距离。' },
      { claim: '蒙古帝国创造了欧亚贸易。', correction: '贸易早已存在；蒙古扩张改变了部分路线的安全、管理与交流规模，也伴随战争破坏。' },
    ],
    checks: [
      { question: '举出贸易增长的一项非经济后果。', answer: '宗教传播、跨文化知识交流或病原体扩散；还需说明商人、旅行者等传播载体。' },
      { question: '印度洋和跨撒哈拉贸易有哪些共同条件？', answer: '都需要适应环境的运输知识、沿途节点与商人合作；具体技术分别可用季风航海和骆驼商队说明。' },
    ],
    nextStep: '画一条“环境条件→运输方式→交易规模→文化后果”的链，每个箭头补一句机制。',
  },
  'world-empires': {
    objectives: ['区分军事征服与长期治理所需的资源。', '比较帝国在税收、官僚和宗教方面的不同选择。'],
    sections: [
      { title: '夺取城市，不等于控制帝国', body: 'c.1450–1750 的奥斯曼、萨法维和莫卧儿等帝国运用火药武器扩张，但军队依赖税收、人员与补给。奥斯曼 1453 年攻取君士坦丁堡可说明炮兵的军事作用；城堡被攻下后，征税、任官与地方合作才决定统治能否持续。' },
      { title: '治理中的结合与区别', body: '奥斯曼苏丹既运用伊斯兰权威，也以法律和官员管理多宗教人口。莫卧儿阿克巴吸纳部分拉杰普特精英、取消吉兹亚税，以扩大合作基础；政策随统治者变化。清朝保留儒家官僚制度，同时维持满洲身份及对不同边疆的治理安排，不能统称为单一“宽容政策”。' },
    ],
    keyPoints: [
      { label: '火药武器', explanation: '大炮和火枪提升部分战场能力，效果仍取决于组织、财政、地形和对手。' },
      { label: '财政与军队', explanation: '征税支持军队，军队又协助维持税源，形成互相依赖的国家能力。' },
      { label: '地方精英合作', explanation: '授予职位或承认地方影响力，可减少统治阻力，同时给地方留下议价空间。' },
      { label: '宗教合法性', explanation: '统治者用宗教身份、建筑或赞助解释其权威；具体政策可能整合也可能排斥群体。' },
    ],
    example: { title: '给“火药帝国”加上解释', question: '“奥斯曼因大炮而强大”为什么不足以解释其长期统治？', walkthrough: '1453 年的军事胜利支持“炮兵帮助征服”，不能独自证明几个世纪的行政稳定。需要补上财政供给、官员执行、地方协商和合法性的证据。', answer: '大炮帮助奥斯曼突破城防，而持续的财政和行政组织使军事优势能够转化为长期治理。征服机制与巩固机制相互联系，但不能互相替代。' },
    misconceptions: [
      { claim: '所有陆地帝国都使用同一种官僚制度。', correction: '共同面对税收和控制问题，并不意味着选官、军役和地方自治安排相同。' },
      { claim: '阿克巴的政策代表整个莫卧儿时期从未变化。', correction: '宗教与精英政策随统治者和政治处境变化，需注明统治者与时期。' },
    ],
    checks: [
      { question: '征收稳定税款为什么有助于帝国扩张？', answer: '税款可支付军队、购买武器和供应后勤，使扩张具有持续资源。' },
      { question: '“清朝保留科举”证明所有族群受到完全相同治理吗？', answer: '不能。一个中央制度不能代表全部边疆与身份安排，仍需分别查看具体地区和群体。' },
    ],
    nextStep: '选两个帝国，分别写“军事手段＋治理手段＋地方回应”，再建立有共同维度的比较。',
  },
  'world-oceans': {
    objectives: ['连接航海、殖民与跨大西洋劳动体系。', '说明哥伦布大交换对不同地区为何影响不对称。'],
    sections: [
      { title: '海路把原有区域连接到一起', body: '1492 年后的持续跨大西洋接触推动植物、动物与病原体在美洲和非洲—欧亚大陆间流动。欧洲航海使用并改造来自多地的知识；王室资助、商人资本和竞争目标共同推动航行，不是一个新发明自动造成殖民帝国。' },
      { title: '人口、环境与强制劳动', body: '天花等疾病造成美洲原住民人口重大损失，战争与强迫劳动也加深破坏。玉米和马铃薯传入非洲、欧亚部分地区后增加食物选择；蔗糖种植园需求与殖民暴力推动跨大西洋奴隶贸易。疾病不是强制劳动的借口，也不能把所有劳动制度视为同一种奴隶制。' },
    ],
    keyPoints: [
      { label: '哥伦布大交换', explanation: '持续跨大西洋接触引发的生物与生态交换，既包含作物、牲畜，也包含疾病。' },
      { label: '种植园 plantation', explanation: '以糖等商业作物为中心的生产组织，许多美洲种植园依赖被奴役非洲人的劳动。' },
      { label: '银与全球贸易', explanation: '美洲白银经大西洋及太平洋路线流动，与欧洲贸易和亚洲对白银的需求连接。' },
      { label: '殖民社会等级', explanation: '出身、法律身份与种族化分类影响机会和权力，实际社会关系仍有地区差异。' },
    ],
    example: { title: '同一次交换，不同的后果', question: '用美洲与欧亚各一例，限定“跨洋交流改善了所有人的生活”。', walkthrough: '先给地区与机制：美洲疾病冲击削弱原住民社会；马铃薯在欧洲部分地区成为重要食物。再比较群体，避免把总体粮食增长等同于所有个人受益。', answer: '跨洋交流扩大了部分地区的食物供应，但它也伴随美洲人口灾难和种植园强迫劳动，因此收益与代价高度不均衡，无法概括为所有人生活改善。' },
    misconceptions: [
      { claim: '哥伦布大交换就是欧洲给美洲的单向传播。', correction: '玉米、马铃薯等由美洲向外传播；交换具有双向流动，但代价并不对称。' },
      { claim: '美洲原住民人口下降完全由疾病解释。', correction: '疾病是关键因素，战争、剥削、饥荒与社会破坏也会影响人口和恢复能力。' },
    ],
    checks: [
      { question: '玉米传往非洲属于哪一类交换？', answer: '由美洲向非洲的作物传播及其农业、饮食后果。' },
      { question: '为什么“糖消费增加→奴隶贸易扩大”还需要机制？', answer: '需求必须通过殖民种植园、土地控制和强制劳动制度转化为劳工掠夺，不能只并列现象。' },
    ],
    nextStep: '选糖、白银或马匹，追踪“产地→运输路线→劳动制度→两类群体的后果”。',
  },
  'world-revolutions': {
    objectives: ['把启蒙观念与革命的财政、社会背景连起来。', '比较革命宣称的权利和不同群体实际获得的权利。'],
    sections: [
      { title: '观念提供语言，危机推动行动', body: '启蒙思想中的自然权利、人民主权与对专制的批评，为挑战旧制度提供语言。法国 1789 年革命还与财政困境、等级特权及政治代表权冲突有关。思想能解释诉求如何被表达，不能独自解释革命为何在某时某地爆发。' },
      { title: '谁被包含在“人民”之中', body: '海地革命始于 1791 年，1804 年建立独立国家，把反殖民与反奴隶制结合；它不能仅被当作欧洲观念的被动复制。美洲其他独立运动中，克里奥尔精英常获得政治权力，但独立不必然终结种族、性别或土地不平等。民族主义则把共同民族身份与政治自决连接。' },
    ],
    keyPoints: [
      { label: '自然权利', explanation: '主张某些权利并非由君主赐予；实际被承认的权利主体仍可能受排斥。' },
      { label: '人民主权', explanation: '政治权威应来自人民，但“人民”的定义与代表制度需要进一步考察。' },
      { label: '民族主义', explanation: '把共享的身份、历史或文化与政治共同体联系，可支持独立，也可支持国家扩张。' },
      { label: '革命程度', explanation: '分别观察政治、经济和社会结构；换国旗与废除奴隶制是不同维度的变化。' },
    ],
    example: { title: '写有范围的革命判断', question: '如何限定“十八至十九世纪大西洋革命都实现了平等”？', walkthrough: '海地终结奴隶制并争取独立，显示社会身份发生根本变化；其他独立后的国家仍可能维持奴隶制或限制政治权利。必须说明平等的指标和群体。', answer: '大西洋革命扩大了权利语言和挑战殖民权威的空间，但社会平等的实现程度不同；海地反奴隶制的成果不能代表所有革命都消除了既有等级。' },
    misconceptions: [
      { claim: '启蒙运动直接、单独造成了所有革命。', correction: '观念需要与财政危机、战争、社会利益与组织行动一起分析。' },
      { claim: '民族主义必然等于民主。', correction: '民族自决关心政治共同体的归属，不自动保证普遍参政或少数群体的权利。' },
    ],
    checks: [
      { question: '法国王室债务属于革命原因中的什么？', answer: '财政与政治危机；它促使政府寻求改革，并与等级特权、代表权冲突相互作用。' },
      { question: '检验“革命实现自由”至少需要补哪两个条件？', answer: '自由针对哪一群体，以及以何种法律或社会指标衡量，如奴隶制、投票权、土地权。' },
    ],
    nextStep: '选法国与海地，以“权利对象”和“社会结构改变”作两个共同维度写比较。',
  },
  'world-industrialization': {
    objectives: ['解释工业化为什么需要一组相互配合的条件。', '比较生产增长与劳动、城市生活的不同后果。'],
    sections: [
      { title: '从家庭生产到工厂体系', body: '工业化包含机械化、能源变化与生产组织重组。英国的煤炭、资本、市场、劳动供给和运输网络共同支持这一过程；早期纺织厂也使用水力。蒸汽机不是瓦特从无到有独自发明，纽科门 1712 年的抽水机已服务矿井，后续改良提高了使用范围。' },
      { title: '同一种机器，影响不同的人', body: '工厂集中机器和工人，扩大产量，也让时间纪律、工资依赖与职业风险更突出。城市增长可能伴随住房拥挤和污染。日本明治时期通过国家推动基础设施、技术引入和产业发展，说明后来工业化不必完全复制英国路径。劳工组织、社会改革与社会主义思想回应了这些变化。' },
    ],
    keyPoints: [
      { label: '机械化', explanation: '机器承担部分生产步骤；其经济效果取决于动力、维修、劳动技能和市场。' },
      { label: '化石能源', explanation: '煤炭提供高密度能源，蒸汽动力使部分生产不必直接依附水流位置。' },
      { label: '工厂制', explanation: '资本、劳动和机器集中，由管理者协调生产与工作时间。' },
      { label: '资本主义与社会主义', explanation: '前者强调私人资本与市场组织，后者的一系列思想批评资本控制及分配不平等；两者内部都有差异。' },
    ],
    example: { title: '解释一条工业化链', question: '煤炭怎样帮助工业化，又为什么不能解释全部过程？', walkthrough: '煤可为蒸汽机供能，蒸汽机抽水又使更深的煤层开采成为可能，构成反馈。可燃资源必须经技术、资本与运输转化为生产力，有煤并不自动出现工厂。', answer: '煤炭与蒸汽技术相互促进，支持更大规模生产；但投资、市场和基础设施决定技术是否能持续应用，因此资源只是多项条件之一。' },
    misconceptions: [
      { claim: '工业革命一开始就由蒸汽全面取代水力。', correction: '动力转换是渐进且不均衡的，许多早期工厂仍依赖水力。' },
      { claim: '产量增加表示所有工人立即更富裕。', correction: '需要分别考察工资、工时、物价、风险及时间变化，不能用总产量替代生活水平。' },
    ],
    checks: [
      { question: '为什么资本是工业化条件？', answer: '机器、厂房和运输需要先期投资，收益常在以后实现；资本使这些支出可行。' },
      { question: '工厂制改变的只是工具吗？', answer: '还改变劳动地点、工作时间、管理方式以及工人与生产资料的关系。' },
    ],
    nextStep: '把英国与日本放在同一表中，比较国家作用、资源条件和技术获得方式。',
  },
  'world-imperialism': {
    objectives: ['区分直接殖民统治与经济控制。', '解释殖民扩张、地方抵抗和迁移之间的具体联系。'],
    sections: [
      { title: '工业需求并非唯一动机', body: 'c.1750–1900，工业国家寻求原料、市场和战略节点，国家竞争与种族化的“文明使命”论述也支持扩张。军事、航运和医疗技术改变力量差距，但地方政治分裂、合作与抵抗会影响结果。殖民地不是完全被动的空间。' },
      { title: '统治与回应都有多种形态', body: '1857 年印度起义包含军人、地方统治者等群体的不满，弹药筒传言是催化因素之一；1858 年英国王室接管东印度公司的统治，不能说起义立即实现独立。契约劳工从印度等地迁往种植园，与奴隶制法律身份有别，但常受到债务和严厉契约限制。' },
    ],
    keyPoints: [
      { label: '直接统治', explanation: '殖民国家直接控制政治机构和行政安排；其下也可能保留部分地方代理人。' },
      { label: '经济帝国主义', explanation: '通过资本、贸易条款或债务施加控制，不要求正式吞并全部领土。' },
      { label: '抵抗的多样性', explanation: '武装起义、谈判、改革和文化维护可并存，参与者目标不必相同。' },
      { label: '契约劳工', explanation: '以限期劳动契约组织的迁移；法律自由度与实际约束需要分别分析。' },
    ],
    example: { title: '从导火索退后一步', question: '“1857 年起义只是由弹药筒引起”遗漏了什么？', walkthrough: '检查更早的不满：领土兼并威胁地方统治者，军人待遇与宗教干预疑虑加深紧张。不同参与者并非共享同一个现代民族国家计划。', answer: '弹药筒传言使已有不满迅速集中，而殖民统治对土地、权威与宗教实践的冲击提供了更深背景。起义改变统治形式，但没有结束英国殖民权力。' },
    misconceptions: [
      { claim: '殖民扩张全是因为需要原料。', correction: '原料需求重要，战略竞争、国内政治和意识形态也可能推动扩张。' },
      { claim: '契约劳工与被奴役者的法律身份完全一样。', correction: '两者存在法律区别；同时不能因为有契约便推断劳动者拥有充分选择。' },
    ],
    checks: [
      { question: '1858 年印度发生的关键统治变化是什么？', answer: '英国王室接管东印度公司的统治权，印度并未因此独立。' },
      { question: '怎样证明“抵抗失败也能改变帝国政策”？', answer: '可用 1857 年起义后公司统治终结、王室接管这一制度变化，区分独立目标与实际后果。' },
    ],
    nextStep: '选一个非洲或亚洲抵抗案例，分别写参与者、目标、行动与短长期结果。',
  },
  'world-conflict': {
    objectives: ['区分大战的结构性原因、触发事件与决策。', '解释全面战争和国家动员对社会的影响。'],
    sections: [
      { title: '从刺杀到大战，中间有人作出选择', body: '1914 年 6 月 28 日萨拉热窝刺杀是第一次世界大战危机的触发事件。帝国竞争、民族主义、军备和同盟结构构成背景，七月危机中的最后通牒、动员与宣战把危机扩大。同盟增加升级风险，但战争不是条约自动启动的机械连锁。' },
      { title: '战争进入工厂与家庭', body: '全面战争使国家更广泛动员工厂、粮食、税收与劳动力，并利用宣传维持支持。一战后的社会与经济不稳定、1929 年后经济大萧条和极端政治相互作用；二战还需分析法西斯扩张与国际应对。分析种族灭绝时要识别国家政策、去人化宣传与执行机构，不能只归因于抽象的“群众心理”。' },
    ],
    keyPoints: [
      { label: '结构性原因', explanation: '较长期塑造冲突风险的关系，如帝国竞争；它解释脆弱性，而非唯一时间点。' },
      { label: '触发事件', explanation: '使已有紧张迅速升级的具体事件，如 1914 年刺杀。' },
      { label: '全面战争', explanation: '国家动员前线以外的大量社会经济资源，不表示每个国家或家庭经历完全相同。' },
      { label: '大规模暴行', explanation: '需要辨认受害群体、政策意图、机构和行动；战争背景不免除施害者责任。' },
    ],
    example: { title: '完善一战解释', question: '把“刺杀引发一战”改成具有机制的两句论证。', walkthrough: '保留事件事实，再解释为什么区域危机扩大：奥匈对塞尔维亚采取行动，各国作出支持、动员和宣战的决策。说明同盟与安全恐惧如何影响选择。', answer: '萨拉热窝刺杀触发奥匈与塞尔维亚之间的危机。既有竞争与同盟使领导人把地区冲突视为国家安全问题，而动员和宣战决策最终把它扩大为欧洲及全球战争。' },
    misconceptions: [
      { claim: '有同盟，所以所有成员都必须同时参战。', correction: '条约条款、国家利益和领导人判断不同，不能把外交决策写成没有选择的自动过程。' },
      { claim: '经济大萧条是二战的唯一原因。', correction: '经济危机有助于解释极端政治的条件，还需考察侵略决策、意识形态与国际秩序。' },
    ],
    checks: [
      { question: '军备竞争与刺杀，哪一个更适合称为触发事件？', answer: '刺杀是具体触发事件；军备竞争属于较长期背景。' },
      { question: '政府管制粮食和转用民用工厂，体现什么？', answer: '全面战争下对经济与平民社会的动员，说明战争影响超出战场。' },
    ],
    nextStep: '建立“长期条件→危机→决策→社会后果”的四栏时间线，检查每条箭头。',
  },
  'world-decolonization': {
    objectives: ['同时分析超级大国竞争与地方行动者的目标。', '比较独立道路及政治独立后的制度、经济挑战。'],
    sections: [
      { title: '冷战是背景，地方社会有自身目标', body: '1945 年后美苏在意识形态、安全与全球影响上竞争，核威慑和代理战争成为国际关系的重要部分。朝鲜战争等冲突有冷战维度，也有本地分裂和政治历史。不能把亚洲、非洲行动者写成完全受操控的棋子。' },
      { title: '独立的道路与代价', body: '印度与巴基斯坦 1947 年独立伴随分治和大规模暴力；谈判式权力转移不意味着过程毫无暴力。阿尔及利亚经 1954–1962 年战争摆脱法国统治，显示另一种路径。新国家还面临殖民边界、经济依赖和政治整合问题；不结盟运动试图扩大自主空间，而非宣告与所有大国断绝联系。' },
    ],
    keyPoints: [
      { label: '冷战', explanation: '美苏主导的长期竞争，既有直接对峙，也有援助、联盟、宣传与代理冲突。' },
      { label: '去殖民化', explanation: '殖民统治被挑战和终结的过程；政治主权的获得不自动终结经济依赖。' },
      { label: '分治 partition', explanation: '领土被划分为不同政治实体，可能产生迁移、少数群体与边界问题。' },
      { label: '不结盟', explanation: '新国家寻求独立外交与合作的政治立场，具体成员的政策仍有差异。' },
    ],
    example: { title: '避免把冷战套进所有解释', question: '比较印度独立与阿尔及利亚独立时，应如何组织论点？', walkthrough: '共同维度是摆脱殖民统治的路径。印度可用政治动员、谈判与分治；阿尔及利亚可用长期战争。接着解释差异，不能以“一个和平、一个暴力”抹去印度分治暴力。', answer: '两者都由地方民族主义行动推动，但权力转移过程不同：印度以谈判达成独立并发生分治，阿尔及利亚则经历对法国的战争；两种道路都伴随严重暴力和国家建设难题。' },
    misconceptions: [
      { claim: '去殖民化完全是美苏促成的。', correction: '殖民地长期政治组织、群众动员和抵抗是关键力量，大国政策只能解释部分外部条件。' },
      { claim: '独立后经济马上不再受前宗主国影响。', correction: '贸易结构、投资、债务与基础设施依赖可能持续，需要分别检验政治和经济变化。' },
    ],
    checks: [
      { question: '不结盟是否等于完全不接受外国援助？', answer: '不等于。不结盟追求外交自主，成员仍可能与多个大国合作或接受援助。' },
      { question: '为什么“印度以和平方式独立”需要限定？', answer: '权力转移有谈判路径，但 1947 年分治伴随大规模暴力和迁移，不能把全部过程称为和平。' },
    ],
    nextStep: '为一个新独立国家列出“独立前诉求、转移过程、独立后难题”，再加入冷战影响。',
  },
  'world-globalization': {
    objectives: ['用技术、制度与生产网络解释全球化。', '比较全球联系的收益、分配问题与环境代价。'],
    sections: [
      { title: '联系变密，需要技术也需要制度', body: '集装箱运输、航空和数字通信降低跨区域协调成本，跨国企业把生产步骤安排在不同国家。贸易规则、金融制度和国家政策决定这些技术怎样被使用；全球化并非边界消失，也不是世界各地以同一速度参与。' },
      { title: '全球问题与全球回应', body: '供应链扩大市场和就业机会，也可能让劳工与地区承担不同风险。化石燃料使用带来跨境环境后果；1987 年《蒙特利尔议定书》针对消耗臭氧层物质建立国际控制安排，是协作治理的例子。臭氧耗损与全球变暖机制不同，不能把一个环境协议当作所有问题都已解决的证据。' },
    ],
    keyPoints: [
      { label: '全球供应链', explanation: '设计、原料、制造和销售跨多地分工；一个产品的出口国不代表全部价值来源。' },
      { label: '文化传播与混合', explanation: '媒体、迁移与商业传播文化，同时出现本地改编；流行相似不等于文化完全一致。' },
      { label: '不均衡收益', explanation: '消费者、工人、企业和地区可能承受不同收益与代价，需要分群体考察。' },
      { label: '国际环境合作', explanation: '共同规则、监测与资金支持可协调跨境问题，但效果取决于执行和具体机制。' },
    ],
    example: { title: '检验“世界越来越一样”', question: '全球连锁餐厅出现本地菜单，支持还是反驳文化同质化？', walkthrough: '品牌和经营模式跨境传播支持部分相似化；本地口味改编显示地方文化继续塑造消费。两项证据衡量的维度不同，可以同时成立。', answer: '全球商业使品牌和消费形式趋近，但本地菜单显示文化适应与混合。更可辩护的判断是某些商业形式趋同，而地方习惯并未完全消失。' },
    misconceptions: [
      { claim: '全球化是 1991 年以后才从零开始的。', correction: '早期贸易、迁移和帝国已形成全球联系，后期技术与制度改变其密度和形式。' },
      { claim: '臭氧层恢复与减少二氧化碳是同一问题。', correction: '臭氧耗损与气候变化的机制及政策对象不同，部分物质有交叉影响也不能混为一谈。' },
    ],
    checks: [
      { question: '手机在多国完成设计和制造，体现哪种经济联系？', answer: '全球供应链及跨国生产分工。' },
      { question: '为何全球贸易总额增长不能单独证明所有国家都受益？', answer: '总额未显示收入、劳动条件、环境成本和各地区的分配情况。' },
    ],
    nextStep: '选一个日常产品，追踪三处生产或消费节点，分别写收益者、风险承担者与证据。',
  },
  'world-causation': {
    objectives: ['用时间顺序、作用机制和证据检验因果。', '在明确时期中同时解释变化与延续。'],
    sections: [
      { title: '事件先发生，只是因果的起点', body: '原因必须先于所解释的结果，但先后关系本身不够。写“贸易增长后城市扩大”仍需说明商人定居、税收或就业如何促进城市。区分长期条件、短期触发和结果，必要时考虑反馈：蒸汽抽水有助于煤矿开采，煤又为机器供能。' },
      { title: '延续同样需要解释', body: '分析 c.1750–1900 工业化，可说机械和工厂扩展改变生产方式，但家庭劳动和农业并未同时消失。先规定地区、起止时间和指标，再评价变化程度。时期的结束不是“变化已经完成”；同一制度也可能名称延续、功能改变。' },
    ],
    keyPoints: [
      { label: '机制 mechanism', explanation: '说明原因通过哪些行动或中间环节影响结果，是连接两件事的解释。' },
      { label: '多重原因', explanation: '技术、政治和经济条件可共同作用，不必把某一因素写成唯一原因。' },
      { label: '转折点', explanation: '显著改变发展方向或速度的事件；需用前后证据证明其重要程度。' },
      { label: '延续与变化', explanation: '同一时期可在政治、经济和社会等不同维度呈现不同速度。' },
    ],
    example: { title: '把事件清单改成解释', question: '修改“英国有煤、有蒸汽机、工厂很多，所以发生工业化”。', walkthrough: '把并列名词连成过程：可开采煤提供能源，蒸汽动力推动部分机械生产，投资和市场支持工厂扩张。再保留边界：早期水力仍重要，不能把蒸汽当作全部起点。', answer: '煤与蒸汽技术相互支持，降低部分机械生产的能源限制；当资本和市场需求支持集中投资时，工厂得以扩张。工业化因此由多个条件相互配合推动，而非单项发明必然造成。' },
    misconceptions: [
      { claim: '后来发生 B，所以 A 一定造成 B。', correction: '还需检验机制、替代原因和与论点不符的案例，时间顺序无法单独证明。' },
      { claim: '写出三项变化，就完成了延续与变化分析。', correction: '还需说明变化程度及至少一项有证据的持续现象，并解释两者为何并存。' },
    ],
    checks: [
      { question: '“一战前军备增长”和“1914 年刺杀”分别适合哪种原因角色？', answer: '前者是长期条件，后者是短期触发；最终升级还涉及领导人决策。' },
      { question: '证明“工业化后农业仍重要”需要什么？', answer: '明确地区和时期，并提供劳动、产量或社会组织等具体延续证据，不能仅说“没有完全消失”。' },
    ],
    nextStep: '把自己的一个因果论点标成“条件—行动—中间结果—最终结果”，寻找缺失环节。',
  },
  'world-comparison': {
    objectives: ['用共同维度建立比较，而非两份独立简介。', '把史料内容、来源分析与论证用途连起来。'],
    sections: [
      { title: '比较的单位必须相同', body: '比较奥斯曼与莫卧儿治理，可共同考察财政、地方精英和宗教政策。如果一边写武器、一边写文学，就难以得出有意义的异同。先提出比较判断，再用双方具体证据解释差别；“两者都强大”没有说明比较维度。' },
      { title: '史料既是信息，也是一次行动', body: '阅读材料时区分“它说了什么”和“作者为何这样说”。统治者颂扬自己可能意在争取服从，商人报告可能重视商业安全；这影响材料能证明的范围，而非自动使它无效。说明来源特征怎样影响你的解释，不能只列作者、目的、受众四个词。' },
    ],
    keyPoints: [
      { label: '共同维度', explanation: '让双方回答同一个问题，如统治者如何获得地方合作。' },
      { label: '内容证据', explanation: '具体引用或转述材料中的信息，并说明它支持哪个论点。' },
      { label: '来源分析 sourcing', explanation: '解释背景、立场、目的或受众怎样塑造材料，及其对论证的意义。' },
      { label: '互证 corroboration', explanation: '与其他独立材料比较一致和冲突，检验可支持的结论。' },
    ],
    example: { title: '材料有立场，仍能使用', question: '若一份明确标为虚构练习的王室公告宣称“所有臣民都拥护新税”，能得出什么？', walkthrough: '公告能直接显示王室试图把新税描述为具有共识，不能直接证明所有人的实际态度。需要地方请愿、征税记录等不同来源检验接受程度。', answer: '它适合支持“王室利用共识语言为新税建立正当性”，不足以支持“全体居民实际同意”。目的分析限制了可推结论，也揭示统治策略。' },
    misconceptions: [
      { claim: '有偏见的史料没有价值。', correction: '立场可能限制事实陈述的代表性，同时能揭示作者利益、宣传或身份。' },
      { claim: '写“作者是国王，所以有偏见”就完成分析。', correction: '还需解释国王的具体目的怎样影响内容，以及为什么这对当前论点重要。' },
    ],
    checks: [
      { question: '为什么“奥斯曼有大炮，莫卧儿有绘画”难以成为比较？', answer: '两项证据没有回答同一个问题；应把双方都放入军事、文化赞助等共同维度。' },
      { question: '宣传公告最直接证明的是公众态度还是官方表述？', answer: '官方希望传达的表述；公众态度需要其他证据。' },
    ],
    nextStep: '找一段真实材料，写“内容支持什么→作者处境如何塑造它→还需要什么互证”。',
  },
  'elc-rhetorical': {
    objectives: ['区分作者、受众、目的、背景和迫切缘由。', '用具体情境解释选择的作用。'],
    sections: [
      { title: '先问这段话要谁做什么', body: '作者是谁并不只是一条传记信息：职位、经验和与读者的关系影响可信度。受众是具体的读者或听众，目的则是作者希望他们相信、感受或采取的行动。“主题是图书馆”与“说服家长支持延长开放时间”并不等同。' },
      { title: 'Context 与 exigence', body: 'Context 是较广的处境，如预算讨论和学校政策；exigence 是使这次表达变得迫切的问题，如本周即将投票削减开放时间。分析时把选择连向这一情境：针对担心支出的家长提供可核验的成本，比笼统说“吸引读者”更准确。' },
    ],
    keyPoints: [
      { label: 'Speaker / writer', explanation: '发言者的身份、角色和经验，未必等同于现实作者的全部人生。' },
      { label: 'Audience', explanation: '具有具体知识、顾虑和行动能力的受众；要用称呼、论据或发布场合判断。' },
      { label: 'Purpose', explanation: '希望实现的效果，用行动动词表达，如敦促、辩护、重新界定、警告。' },
      { label: 'Exigence', explanation: '促使作者在此时表达的迫切问题，不等于整段文章的主题。' },
    ],
    example: { title: '原创英文短文：延长图书馆时间', question: 'A student writes to the school board before a budget vote: “At five, our library closes. At five, many of us are still waiting for a bus. Keep one room open until six, and that hour can become homework time rather than another hour lost.” 目的与选择怎样连接？', walkthrough: '受众是有预算权的校董。重复 “At five” 把关闭时间与学生处境并置；“one room”“one hour” 把要求呈现为有限、可实施的改变。', answer: 'Sample claim: By pairing the closing time with students’ unfinished journeys, the writer reframes an extra library hour as a practical response to wasted time, urging the board to approve a limited extension.' },
    misconceptions: [
      { claim: 'Purpose 就是文章主题。', correction: '主题回答谈什么；目的回答作者希望受众发生什么改变。' },
      { claim: '受众永远是“所有读者”。', correction: '首先寻找文本中的具体指向与决策能力，不能忽略目标受众的顾虑。' },
    ],
    checks: [
      { question: '短文的 exigence 是什么？', answer: '即将进行的预算投票，使延长开放时间的请求需要现在提出。' },
      { question: '“one room”为什么可能适合这一受众？', answer: '它缩小请求范围，回应预算决策者对成本和可实施性的顾虑。' },
    ],
    nextStep: '用“面对……受众的……顾虑，作者通过……敦促……”写一句情境分析。',
  },
  'elc-appeals': {
    objectives: ['说明可信度、情感和推理如何由文本产生。', '避免只贴 ethos、pathos、logos 标签。'],
    sections: [
      { title: 'Appeal 是作用，不是三个盒子', body: 'Ethos 涉及作者被视为可信、知情或公正的方式；pathos 调动与论点相关的情感和价值；logos 让受众沿证据与推理接受结论。同一个细节可同时发挥多个作用。数字未必可靠，个人经验也未必只能产生情感。' },
      { title: '把标签展开成解释', body: '分析时指出具体语言、受众的关切和它如何推进目的。“作者使用 pathos 让读者有感情”没有说明哪种情感及其用途。谨慎使用“使读者必然……”：修辞选择提供说服的可能，无法保证所有实际读者产生同一种反应。' },
    ],
    keyPoints: [
      { label: 'Ethos', explanation: '专业经历、坦承局限或公平回应异议都可能建立可信度。' },
      { label: 'Pathos', explanation: '具象处境可激起关怀、忧虑或责任感；要说明情感怎样与主张相连。' },
      { label: 'Logos', explanation: '比较、因果、例证与统计都可能构成推理，但仍需检验证据与结论是否匹配。' },
      { label: '受众适配', explanation: '相同例证对不同受众可能作用不同，不能离开情境讨论 appeal。' },
    ],
    example: { title: '原创英文短文：志愿者的建议', question: '“I have staffed the evening desk for three years. I cannot promise an empty waiting room, but I can tell you what one extra nurse would change: a frightened parent would speak to a person before speaking to a form.” 作者怎样争取支持？', walkthrough: '“three years”呈现相关经验；“cannot promise”承认限制，避免夸张承诺；“a person…a form”的对比把等待问题转成人际关怀。多种 appeal 在同一推理中合作。', answer: 'Sample commentary: The admission of limits makes the volunteer’s proposal sound measured, while the contrast between a person and a form gives the staffing request a human consequence that administrators might otherwise overlook.' },
    misconceptions: [
      { claim: '出现数字就是 logos，且一定客观。', correction: '数字可能只是身份年限或未经核实的统计；必须检验它实际支持了什么。' },
      { claim: '带情感的论证就没有逻辑。', correction: '情感能凸显证据涉及的价值，关键是它是否替代或歪曲了必要推理。' },
    ],
    checks: [
      { question: '“I cannot promise”为何可能建立 ethos？', answer: '它承认能力和方案的边界，使作者显得审慎，而非保证无法证明的成果。' },
      { question: '这段话证明增加护士一定缩短全部等待吗？', answer: '没有。它提出人与人沟通的改善，未提供足以证明全部等待时间变化的数据。' },
    ],
    nextStep: '从短文找一个细节，用两种不同作用解释它，再说明哪种与作者目的关系更直接。',
  },
  'elc-analysis': {
    objectives: ['把写作选择、文本证据、作用和目的连成分析。', '形成可辩护而非技巧清单式的修辞论点。'],
    sections: [
      { title: '作者在做什么，比术语更重要', body: '修辞选择可用普通动词表达：对比两种经历、承认反对意见、由个案转向群体。Thesis 要解释这些选择如何推进信息或目的，而非只列“diction, syntax, imagery”。并非每段都要寻找罕见手法，普通安排也可能承担关键作用。' },
      { title: '分析段落的四个环节', body: '先提出一项有功能的判断，提供短而具体的文本证据，再说明它改变了受众怎样理解问题，最后连接作者目的。评论应从语言细节推到功能，避免把原文换词重复。对效果的解释要与受众及上下文相符，不能任意想象读者反应。' },
    ],
    keyPoints: [
      { label: 'Choice', explanation: '作者可观察的语言或结构行动，如把个人经历与政策结果并置。' },
      { label: 'Evidence', explanation: '足以定位该选择的原文短语或准确转述，不需复制整段。' },
      { label: 'Commentary', explanation: '解释这个细节为什么具有作用，补出受众、价值或推理之间的连接。' },
      { label: 'Purpose connection', explanation: '说明该局部作用怎样帮助作者实现整体目标，而非结尾泛称“persuasive”。' },
    ],
    example: { title: '原创英文短文：重新理解公园', question: '“On the city map, this park is a green square. To the children who live above the highway, it is the only place where a ball can fall without meeting a car. Before calling it unused land, stand here at four.” 如何写修辞论点？', walkthrough: '作者先呈现地图的抽象视角，再用儿童活动的具体限制重新界定土地价值；结尾直接邀请决策者观察，使批评转成可执行要求。', answer: 'Sample thesis: By contrasting the map’s abstraction with children’s need for a safe place, the writer challenges a narrow definition of useful land and asks city officials to observe the park before approving its removal.' },
    misconceptions: [
      { claim: '识别越多修辞术语，分析就越好。', correction: '术语数量不等于解释质量；一项有文本依据且解释充分的选择更有分析价值。' },
      { claim: '修辞分析主要判断作者的政策是否正确。', correction: '重点是文本怎样推进主张；可以讨论推理限制，但不能用个人立场替代语言分析。' },
    ],
    checks: [
      { question: '“The writer uses contrast”还缺哪一环？', answer: '对比的具体内容、它怎样改变受众理解，以及它服务什么目的。' },
      { question: '“stand here at four”在段落中有什么功能？', answer: '把抽象争论转向现场观察，暗示决策者现有判断缺少对实际使用情况的了解。' },
    ],
    nextStep: '用这段短文写四句：分析判断、短证据、功能解释、目的连接。',
  },
  'elc-claims': {
    objectives: ['区分主题、事实与可争辩的主张。', '用条件和范围使 thesis 更精确。'],
    sections: [
      { title: 'Thesis 要承担一个判断', body: '“Schools use technology”是背景事实；“Schools should limit phone use during collaborative tasks”提出可争辩政策。有效主张需回应题目，指明判断及范围，并允许后文用证据支持。“Technology has pros and cons”只承认两面，没有作出足够明确的判断。' },
      { title: 'Qualification 不是犹豫', body: '限定指出论点在什么条件下成立，例如区分课堂任务与紧急联系。它可以让主张更准确，而非把立场退回“it depends”。先说主要判断，再解释重要条件；不要为显得复杂随意附上一句没有后文支持的反面观点。' },
    ],
    keyPoints: [
      { label: 'Claim', explanation: '要求读者接受的判断，可涉及事实解释、价值或政策。' },
      { label: 'Thesis', explanation: '控制整篇论证的中心主张，后续段落需要共同支持它。' },
      { label: 'Scope', explanation: '主张适用的群体、时间和情境；范围越大，需要的证据通常越广。' },
      { label: 'Qualification', explanation: '对条件、程度或例外的有理由限定，使结论与证据匹配。' },
    ],
    example: { title: '原创论证练习：学生期限', question: '原创 prompt: To what extent should schools allow students to choose assignment deadlines? 提炼一个可支持的 thesis。', walkthrough: '“Students deserve freedom”过于宽泛；“All deadlines should disappear”忽略共同反馈和合作任务。区分任务类型，保留可判断立场，再给能展开的理由。', answer: 'Sample thesis: Schools should let students choose among a small set of deadlines for independent projects because bounded choice encourages planning, while shared deadlines should remain for work that depends on peer feedback.' },
    misconceptions: [
      { claim: 'Thesis 必须写出三个理由才成立。', correction: '没有通用的三理由要求；关键是可辩护、回应题目并能组织后文。' },
      { claim: '加入 although 就自动复杂。', correction: '限定必须解释实际条件或张力，并在证据和推理中得到落实。' },
    ],
    checks: [
      { question: '“Deadlines exist in most schools”是何种陈述？', answer: '可核验的背景性事实，尚未对期限的价值或政策提出可争辩判断。' },
      { question: '样例 thesis 的边界是什么？', answer: '只对独立项目提供有限选项；依赖同伴反馈的任务保留共同期限。' },
    ],
    nextStep: '把你的一句 thesis 圈出判断、适用范围和条件；删除无法在后文兑现的承诺。',
  },
  'elc-evidence': {
    objectives: ['检验一条证据与特定主张的匹配程度。', '准确整合证据并说明其代表性和限制。'],
    sections: [
      { title: '真实、相关、充分是不同问题', body: '证据可能真实却不相关：图书馆借书量增加，未必能证明学生考试成绩提高。相关证据也未必充分：一个人的成功不能证明一种方法对所有人有效。先看主张的范围，再问证据直接衡量什么、来自谁、有没有合理替代解释。' },
      { title: '引用后还需要一座桥', body: '用交代情境的短语引入来源，引用关键部分或准确转述，再解释它为何支持段落判断。不要把原有的“部分”“可能”改成“全部”“必然”。如果资料只是说明使用者满意度，就不能擅自写成随机实验已经证明因果。' },
    ],
    keyPoints: [
      { label: 'Relevance', explanation: '证据必须回应当前主张，而非仅与同一主题有关。' },
      { label: 'Specificity', explanation: '给出足够具体的行为、情境或事实，使读者能判断推理；不能编造精确数字。' },
      { label: 'Sufficiency', explanation: '支持的数量、质量与覆盖面应匹配结论范围，不能靠堆砌弱例子弥补缺口。' },
      { label: 'Warrant', explanation: '解释为什么该证据能通向结论的原则或推理桥梁。' },
    ],
    example: { title: '原创练习材料：选出更匹配的证据', question: 'Claim: An evening library program improves access to a study space. Fictional practice evidence: A. A student likes the new chairs. B. Entry logs show visits between six and eight. C. The town has many books. 哪项最直接？', walkthrough: 'B 直接记录新增时段的使用情况，最贴近“空间可用性”。A 涉及舒适度，C 涉及藏书；但 B 仍不能独自证明成绩提高或所有学生都能到达。', answer: 'Sample commentary: The evening entries show that the new hours are actually used, supporting the claim that the program creates a practical study opportunity. They do not establish who remains excluded or whether grades improve.' },
    misconceptions: [
      { claim: '只要引用权威来源，就一定支持我的论点。', correction: '来源可信度和论证相关性必须分别检查；权威也可能谈的是另一个问题。' },
      { claim: '详细的数据比个人例子永远更好。', correction: '应按论点选择证据，并核验数据方法；精确但无关的数字不比相关的具体事例更有用。' },
    ],
    checks: [
      { question: 'B 能证明学生成绩因此提高吗？', answer: '不能。它记录出入行为，没有成绩测量及排除其他原因的设计。' },
      { question: '把“some visitors”改成“all students”有什么问题？', answer: '扩大了证据覆盖范围，使结论超过原资料能支持的程度。' },
    ],
    nextStep: '为一段论证逐项写“证据直接显示什么”和“我据此推断什么”，检查跨越。',
  },
  'elc-synthesis': {
    objectives: ['围绕自己的判断组织来源，而非逐篇复述。', '解释来源之间的支持、冲突与限定。'],
    sections: [
      { title: '先决定你在回答哪个问题', body: 'Synthesis 的中心应是你的论点。来源可以说明不同方面，也可能采用不同定义或衡量指标；它们的冲突不一定意味着某一方错误。先建立主张和子问题，再按“成本、参与、公平”等共同维度放置材料，避免写成 Source A says…Source B says…的读书报告。' },
      { title: '让来源对话', body: '一份材料提供总体趋势，另一份揭示被平均数遮住的群体，可以共同限定结论。解释这种关系后，还要明确你因此支持什么选择。实际练习中按题目要求引用所给来源；不要虚构材料、作者、数字或把自己的假设包装成来源内容。' },
    ],
    keyPoints: [
      { label: 'Support', explanation: '两个来源可以从不同层面支持同一子主张，但不必重复同一内容。' },
      { label: 'Tension', explanation: '来源给出冲突结果时，检查人群、时期、定义或方法是否不同。' },
      { label: 'Qualification', explanation: '一个来源指出另一来源结论的边界，让自己的判断更精确。' },
      { label: 'Source-led / claim-led', explanation: '逐份资料报告由来源主导；围绕子主张安排来源才由论证主导。' },
    ],
    example: { title: '原创虚构来源：公交试点', question: 'Practice Source A: “Riders describe the later bus as useful after club meetings.” Practice Source B: “Students outside the route still need a ride home.” 用两条材料提出判断，均为虚构练习资料。', walkthrough: 'A 支持晚班车对线路内参加活动者有实际价值；B 指出空间覆盖限制。两者并不矛盾，可形成“保留有效试点并处理覆盖问题”的条件性建议。', answer: 'Sample synthesis: The school should retain the late bus because it serves students staying for activities (A), but access should not be measured by riders alone. The route exclusions described in B justify reviewing additional stops before calling the program equitable.' },
    misconceptions: [
      { claim: '每段只摘要一个来源就是 synthesis。', correction: '摘要是准备步骤；正文还需要用自己的子主张解释来源之间的关系。' },
      { claim: '来源冲突时必须选一个全对、另一个全错。', correction: '先比较问题、样本与指标，来源可能描述同一政策的不同群体或后果。' },
    ],
    checks: [
      { question: 'A 与 B 是直接互相否定吗？', answer: '不是。A 谈线路内使用者的收益，B 谈线路外群体的限制。' },
      { question: '样例中的原创判断是哪一句意思？', answer: '保留试点，同时评估新增站点；这一建议由两份材料的关系推导，并非照抄某份来源。' },
    ],
    nextStep: '把你已有来源放入同一子问题下，给每对来源标“支持、冲突或限定”，写出原因。',
  },
  'elc-argument': {
    objectives: ['以具体证据和解释支持独立立场。', '公平处理最有力的反论点，并据此回应或修正。'],
    sections: [
      { title: '例子要做论证工作', body: 'Argument 不是先表态再列几个名人。一个例子需要说明发生了什么、它体现什么机制、为什么与题目相关。个人经验可以使用，但应承认其范围；历史或社会事实必须准确，不能为使例子整齐而补造日期、研究或引言。' },
      { title: '反论点是检验，不是装饰', body: '先把对方最合理的顾虑说清楚，再选择反驳事实、区分条件、承认代价或修正立场。Concession 承认某一点成立，rebuttal 解释它为何不推翻主要结论。不要把所有反对者描述成愚蠢、自私的人，这会回避真正的问题。' },
    ],
    keyPoints: [
      { label: 'Line of reasoning', explanation: '一组相互连接的理由，使读者看见证据怎样共同支持 thesis。' },
      { label: 'Counterargument', explanation: '有理由挑战你的结论、条件或优先级的替代观点。' },
      { label: 'Concession', explanation: '承认对方有依据的一点，常能明确真实代价或适用条件。' },
      { label: 'Rebuttal', explanation: '解释反对理由为何不足、在何处不适用，或怎样通过方案调整解决。' },
    ],
    example: { title: '原创 argument 练习：展示未完成作品', question: 'Prompt: Should students share unfinished work with classmates? Draft: “In our design group, an early sketch exposed a measurement error before we bought materials. Yet some drafts contain private experiences.” 建立有条件的立场。', walkthrough: '测量错误支持早期反馈能减少返工；私密经历是真实的反对理由，适合通过选择分享范围回应，不必否认同伴反馈的价值。', answer: 'Sample claim: Students should share selected unfinished work when feedback can improve a decision, but they should control whether private material is disclosed. Early review can expose costly mistakes without turning every draft into a public performance.' },
    misconceptions: [
      { claim: '承认反方一点就等于放弃论点。', correction: '承认合理边界可使主张更精确；关键是说明主要立场为何仍然成立。' },
      { claim: '一个成功故事可以证明任何人都应这样做。', correction: '个案支持机制或可能性，普遍政策还需考虑不同情境、成本和反例。' },
    ],
    checks: [
      { question: '样例的 concession 是什么？', answer: '某些草稿包含私人经历，不适合强制公开。' },
      { question: '样例如何回应，而非忽略这个顾虑？', answer: '把分享限定为学生选择的内容，并与能改进决策的反馈目的相连。' },
    ],
    nextStep: '为自己的 thesis 写出最合理的一项挑战，再选择“回应、限定、修正”中的一种。',
  },
  'elc-reasoning': {
    objectives: ['区分 claim、evidence 与 commentary。', '补出证据通向判断时隐藏的推理。'],
    sections: [
      { title: 'Commentary 回答“这又说明什么”', body: 'Evidence 交代事例或文本，commentary 解释它为什么支持判断。例如“学生返工次数减少”只是现象；若论点是早期反馈有价值，就要说明错误在投入更多时间前被发现，因此后续损失减少。把证据换几个同义词不等于评论。' },
      { title: '整篇文章也需要一条链', body: '每段子主张应承担不同任务，例如先证明问题存在，再比较方案，再处理限制。因果解释要补机制，比较要使用共同维度，定义要说明标准。段落之间不能只靠 moreover 连接；读者应能知道为什么下一步需要这个理由。' },
    ],
    keyPoints: [
      { label: 'Claim', explanation: '本段要读者接受的判断，必须与整篇中心论点有关。' },
      { label: 'Evidence', explanation: '支持判断的具体文本、事例或可靠信息。' },
      { label: 'Commentary', explanation: '分析证据体现的机制、原则或意义，说明它如何支持主张。' },
      { label: 'Hidden assumption', explanation: '从证据到结论所依赖的前提；若前提未必成立，就需要解释或限定。' },
    ],
    example: { title: '原创段落：找出缺失的桥', question: '“Peer review should happen before the final draft. In my history essay, a classmate noticed that two paragraphs used the same example. This shows peer review is useful.” 最后一句怎样改进？', walkthrough: '前句是 claim，中间是 evidence；最后一句只重复主张。应解释识别重复如何让作者重新分配证据、扩大支持范围，并说明早期时点为何重要。', answer: 'Sample commentary: Catching the repeated example before submission gave me time to replace it with evidence addressing a second part of the question. The benefit came from having time to act on feedback, which explains why review should precede the final draft.' },
    misconceptions: [
      { claim: '证据足够具体就不需要解释。', correction: '读者可能从同一事例得出不同判断，评论必须说明你采用的推理。' },
      { claim: '任何含 because 的句子都是有效 reasoning。', correction: '连接词只提示关系，后面的理由仍可能无关、循环或缺少必要前提。' },
    ],
    checks: [
      { question: '“Peer review is useful because it is helpful”有什么问题？', answer: '循环重复，没有提供机制、条件或独立理由。' },
      { question: '样例为什么强调 before submission？', answer: '反馈必须来得及转化为修改，才能支持“早期审阅”这一特定主张。' },
    ],
    nextStep: '在自己的段落中用三种标记标 claim、evidence、commentary，删掉只重复判断的句子。',
  },
  'elc-organization': {
    objectives: ['按论证任务安排段落顺序。', '让过渡明确逻辑关系，而非只增加连接词。'],
    sections: [
      { title: '顺序要回应读者需要', body: '提出方案前，读者可能需要知道问题是什么；比较两种方案前，需要共同标准。可采用问题—原因—回应，也可先澄清定义再评价案例，没有一种结构适合所有题目。反向提纲用一句话记录每段“做什么”，比只记录“谈什么”更能发现重复。' },
      { title: 'Cohesion 是局部的可追踪性', body: '指代、关键词和已知信息到新信息的安排帮助句子衔接。“However”表示与前文有真实转折；若只是补充细节，用它会误导关系。每段要有清楚焦点，但不用把全部文章压成同一种五段模板。' },
    ],
    keyPoints: [
      { label: 'Unity', explanation: '句子和段落共同服务一个焦点，删除虽有趣却不承担论证任务的内容。' },
      { label: 'Cohesion', explanation: '词语、指代和句间安排使读者能够跟上局部连接。' },
      { label: 'Progression', explanation: '每段推进一个新步骤，不是用不同措辞反复陈述同一个理由。' },
      { label: 'Reverse outline', explanation: '写后逐段概括功能，再检验缺口、重复和顺序。' },
    ],
    example: { title: '原创英文句组：重新排序', question: 'A. “A sign-out system would preserve access while tracking demand.” B. “Students often cannot borrow the shared calculators when needed.” C. “Because no record shows where devices go, the school cannot tell whether it lacks calculators or simply loses track of them.” 怎样排序？', walkthrough: 'B 提出问题；C 解释信息缺口，说明为什么单纯购买可能不够；A 提供针对缺口的回应。指代 “the school”“demand”依赖前面建立的背景。', answer: 'Order: B → C → A. Sample transition: Before buying more calculators, the school needs to distinguish a shortage from a tracking problem. 这个过渡明确从问题诊断走向方案选择。' },
    misconceptions: [
      { claim: '每段开头加 furthermore 就会连贯。', correction: '连接词不能修复理由重复或缺少前提的问题，先检查实际逻辑关系。' },
      { claim: '任何论证必须严格五段。', correction: '结构应由题目、理由与限制决定，固定段数不保证论证完整。' },
    ],
    checks: [
      { question: '为什么不能在 C 前随便加 however？', answer: 'C 解释 B 的问题，并未否定 B；however 会制造不真实的转折。' },
      { question: '反向提纲写“第二段：计算器”够吗？', answer: '不够，应写“解释缺少追踪记录为何使采购决策困难”，体现论证功能。' },
    ],
    nextStep: '给自己的每段写一个动词短语：界定、证明、比较、限定或回应，再重排检查。',
  },
  'elc-style': {
    objectives: ['从措辞、句法与语境推断语气。', '解释语言细节如何改变强调和受众关系。'],
    sections: [
      { title: 'Diction 不止词典意思', body: '词语的联想与语域影响读者如何看待行动者。“Residents protested”与“a mob swarmed”都可能描述聚集，却把合法性和威胁感安排得不同。分析词语时必须结合上下文，不能看到一个负面词就断定全文愤怒。Tone 是作者对主题或受众的态度，可随着段落推进改变。' },
      { title: 'Syntax 控制速度与焦点', body: '短句可强调转折或结论，但不总意味着紧张；长句可积累条件、解释关系，也不总是复杂思想。平行结构让多个项目显得同等重要，对比则凸显差别。先描述句法观察，再说明它在此处承担的作用，不要背“一切短句都吸引注意”。' },
    ],
    keyPoints: [
      { label: 'Diction', explanation: '词语的准确含义、联想、正式程度和价值判断。' },
      { label: 'Syntax', explanation: '句长、分句顺序、重复和平行等组织方式；效果取决于语境。' },
      { label: 'Tone', explanation: '作者对主题或受众呈现的态度，如审慎、赞赏或讽刺。' },
      { label: 'Emphasis', explanation: '放在句末、重复或单独成句都可能突出信息，需要指明被突出的内容。' },
    ],
    example: { title: '原创双版本：同一计划，不同关系', question: 'A. “The committee will implement the revised schedule following consultation.” B. “We listened. Now we will move lunch ten minutes later, and we will check whether it helps.” 两版语气怎样不同？', walkthrough: 'A 的机构主语和抽象名词呈现正式行政语气。B 用 we 与 listened 建立参与关系，短句强调回应，check 保留评估空间。B 不是因为较短就一定更好。', answer: 'Sample analysis: Version B frames the change as a response to shared experience and an adjustable trial, while Version A presents it as an administrative decision. The preferable style depends on the audience and purpose.' },
    misconceptions: [
      { claim: 'Tone 就是读者读完后的情绪。', correction: 'Tone 指文本呈现的作者态度；读者的个人反应可能不同。' },
      { claim: '长句一定 formal，短句一定 emotional。', correction: '句式效果取决于词语、关系和位置，需要从具体上下文解释。' },
    ],
    checks: [
      { question: 'B 中哪个词最直接表示方案仍需检验？', answer: 'check，表示会评估效果，而非假定改变必然成功。' },
      { question: '“We listened”可怎样影响作者与受众的关系？', answer: '它把决策呈现为对意见的回应，有助于建立被倾听、共同参与的印象。' },
    ],
    nextStep: '把同一条校园通知写成正式、亲近两个版本，逐词解释改变的受众关系。',
  },
  'elc-revision': {
    objectives: ['按段落目的评价增加、删除、改写和移位。', '区分语法正确、内容相关和修辞有效。'],
    sections: [
      { title: '先诊断问题，再选择改法', body: '修改题先问作者要完成什么任务：解释原因、补充证据还是承认限制？一个语法无误、听起来漂亮的句子，也可能偏离段落目的。增加句子应补推理或必要信息，删除句子应减少重复或偏题，移位应改善前提与结论的顺序。' },
      { title: '选项必须通过上下文检验', body: '把候选句实际放回前后文，检查指代对象、逻辑关系、语气和信息重复。遇到 this、these、such 时找清楚它们指向什么。判断最佳修改时使用题干指定目标，而非凭个人偏好选择最复杂或最长的表达。' },
    ],
    keyPoints: [
      { label: 'Addition', explanation: '新增材料应解决明确缺口，例如为概括主张补具体例子。' },
      { label: 'Deletion', explanation: '删除离题、重复或破坏焦点的内容；信息真实不表示必须保留。' },
      { label: 'Placement', explanation: '让背景先于依赖它的说明，理由先于结论，或按作者目的制造必要顺序。' },
      { label: 'Revision criterion', explanation: '用“是否完成题干指定任务”评价选项，语法与修辞目标都要检查。' },
    ],
    example: { title: '原创 writing MCQ：补上具体证据', question: 'Draft: “The repair club teaches practical problem solving. [New sentence] Students leave with a process they can repeat.” Which addition best provides a specific illustration? A. “Problem solving is an important skill.” B. “When a lamp failed, members tested the cord and switch separately before replacing a part.” C. “Some students prefer painting.”', walkthrough: '目标是提供具体例证。B 呈现逐项检测的行为，支持可重复的问题解决过程；A 重复价值判断，C 虽涉及学生却与本段任务不匹配。', answer: 'B. Sample explanation: Testing separate components illustrates a method, so the example prepares readers to understand what the following sentence means by “a process they can repeat.”' },
    misconceptions: [
      { claim: '最长、词汇最高级的选项通常最好。', correction: '最佳修改取决于任务和上下文；复杂表达可能增加含糊或改变原意。' },
      { claim: '句子真实，就不能删除。', correction: '真实信息也可能偏题或重复，是否保留由段落目的决定。' },
    ],
    checks: [
      { question: 'A 为什么不满足题干？', answer: '它再次评价技能重要，没有具体展示修理俱乐部怎样解决问题。' },
      { question: '“a process”在加入 B 后指向什么？', answer: '把潜在故障部件分开检测，再决定更换什么的诊断步骤。' },
    ],
    nextStep: '选自己的一个段落，只做一次修改，并写清“原问题→修改→预期功能”。',
  },
  'elc-reading': {
    objectives: ['按题干要求找到对应文本范围。', '用具体文本排除改变范围、语气或逻辑的选项。'],
    sections: [
      { title: '先分清问内容还是问功能', body: '内容题问作者说了什么；功能题问一处内容在论证中做什么。例如一个故事可以提供反例、建立可信度或引入问题，不能只因它“生动”就选吸引兴趣。圈出题干中的 main purpose、primarily serves、suggests 等任务词，再回到指定句及前后文。' },
      { title: '干扰项常有一半是真的', body: '一个选项可能复用原文词语却改变结论，或把 some 扩为 all，把审慎支持改成彻底反对。为所选答案找一句最直接支持的文本，再指出最诱人的干扰项具体在哪个词越界。无需判断哪句话符合你个人常识。' },
    ],
    keyPoints: [
      { label: 'Textual support', explanation: '答案要由文本支持，不能仅凭主题熟悉或现实常识。' },
      { label: 'Function', explanation: '局部句段对整体推理的作用，如提出限制、转向方案或说明原因。' },
      { label: 'Scope', explanation: '注意群体、程度和时间；绝对词可能超出文章，但不能机械地一见绝对词就排除。' },
      { label: 'Inference', explanation: '基于文本的合理推断，强度必须匹配证据，不等于自由联想。' },
    ],
    example: { title: '原创 reading MCQ：一句话的功能', question: 'Passage: “The new route has shortened my journey. My neighbor, who uses a wheelchair, still cannot reach its nearest stop. A faster bus is an improvement; it is not yet an accessible system.” The neighbor’s example primarily serves to: A. deny that the route saves time; B. qualify the measure of the route’s success; C. argue that all buses should be removed; D. prove that speed never matters.', walkthrough: '开头明确承认时间收益，结尾区分速度与无障碍；邻居事例把成功标准从速度扩大到可达性。A 否定已承认事实，C 无依据，D 把局部限定扩大成绝对判断。', answer: 'B. Sample explanation: The example shows that shorter travel time does not capture access for every user, qualifying the claim of success without denying the improvement.' },
    misconceptions: [
      { claim: '选项出现原文词语就更可能正确。', correction: '词语相同不表示关系相同，应检查是否保留作者的判断与限制。' },
      { claim: '推断题可以根据现实知识补作者没说的事。', correction: '推断仍需文本依据；现实中可能正确的说法也可能超出当前材料。' },
    ],
    checks: [
      { question: '哪句话直接排除 A？', answer: '“The new route has shortened my journey.” 作者承认省时，并非否认。' },
      { question: '作者的总体态度是全盘否定吗？', answer: '不是，是承认改善并指出尚存限制；结尾的 “not yet”保留进一步改进的可能。' },
    ],
    nextStep: '做一题时留下“正确选项的直接证据＋一个干扰项的越界词”，积累自己的错误模式。',
  },
};
