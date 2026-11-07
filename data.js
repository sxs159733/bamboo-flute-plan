/* 课程数据：来自 B 站合集 BV1uUpz6pELZ 的 80 个可播放分 P。
   简介与练习建议为学习计划整理，具体以视频讲解为准。 */
const COURSE = {
  title: '保姆式竹笛零基础到专业大成系统课程',
  shortTitle: '竹笛系统课',
  bvid: 'BV1uUpz6pELZ',
  sourceUrl: 'https://www.bilibili.com/video/BV1uUpz6pELZ/',
  note: '课程简介与练习建议由本站根据分 P 标题和课程结构整理，用于安排学习，具体以视频讲解为准。',
  gapNote: '该合集未收录 019、024、026、028、038、047、053–055、057、064、069、071、077 共 14 讲；站内按实际可播放的 80 个分 P 排课。',
  stages: {
    basic: { name: '入门基础', desc: '吹响、姿势、识谱与第一首小曲', color: '#2F6B4E' },
    skill: { name: '进阶技法', desc: '气息、指法、装饰音与吐音', color: '#4E7C59' },
    theory: { name: '乐理与欣赏', desc: '节奏、记号、调性与演奏审美', color: '#8A6A3B' },
    pop: { name: '流行曲', desc: '用熟悉的旋律练气息与表现', color: '#B4472F' },
    solo: { name: '独奏曲', desc: '完整独奏曲目的分段精讲', color: '#3F5D6B' }
  },
  lessons: [
    {
      id: 'P01', part: 1, no: '001', stage: 'basic', seconds: 114,
      title: '入门第一讲 习笛难度和心态',
      summary: '从学习曲线、常见难点和心态预期讲起，帮助建立“慢练、每天练”的学习节奏。',
      practice: '确定每天固定的 30 分钟练笛时段，准备好笛子、笛膜和一本练习记录。'
    },
    {
      id: 'P02', part: 2, no: '002', stage: 'basic', seconds: 267,
      title: '入门第二讲 竹笛的构造和分类',
      summary: '认识吹孔、膜孔、音孔、基音孔等部位，了解曲笛、梆笛的分类与选笛思路。',
      practice: '对照自己的笛子指出各部位，记录调性、材质和筒音音高。'
    },
    {
      id: 'P03', part: 3, no: '003', stage: 'basic', seconds: 426,
      title: '入门第三讲 如何贴好笛膜，挑选笛膜',
      summary: '讲解笛膜的挑选、裁剪、沾水与粘贴方法，以及膜面松紧对音色的影响。',
      practice: '按步骤贴一次笛膜，分别吹长音比较膜紧、膜松时的音色。'
    },
    {
      id: 'P04', part: 4, no: '004', stage: 'basic', seconds: 164,
      title: '入门第四讲 如何正确快速的吹响竹笛',
      summary: '从口型、风门和气流角度入手，解决吹不响、起音不稳的问题。',
      practice: '做 10 分钟起音练习，每个音吹 4 拍，追求干净、稳定的音头。'
    },
    {
      id: 'P05', part: 5, no: '005', stage: 'basic', seconds: 254,
      title: '入门第五讲 持笛方法与演奏姿势',
      summary: '示范站姿、坐姿、持笛角度和手指自然弯曲，避免耸肩、抬肘等紧张姿势。',
      practice: '对镜持笛 5 分钟，检查肩、肘、腕是否放松，笛身是否保持水平。'
    },
    {
      id: 'P06', part: 6, no: '006', stage: 'basic', seconds: 598,
      title: '入门第六讲 学习简单的识谱',
      summary: '认识简谱的音符、时值、拍号和常见节奏，建立看谱吹奏的基础。',
      practice: '抄写 3 条四拍节奏，边打拍边唱谱，再换成单音吹奏。'
    },
    {
      id: 'P07', part: 7, no: '007', stage: 'basic', seconds: 389,
      title: '入门第七讲 学习全按作5的指法',
      summary: '学习筒音作 5 的指法排列，这是大多数入门曲目使用的基础指法。',
      practice: '从低音 5 到高音 3 慢速上下行，边吹边念音名，连续 5 遍。'
    },
    {
      id: 'P08', part: 8, no: '008', stage: 'basic', seconds: 279,
      title: '入门第八讲 学习正确的呼吸方法',
      summary: '讲解胸腹式联合呼吸与吸气位置，建立气息支撑，减少憋气和头晕。',
      practice: '平躺感受腹式呼吸 3 分钟，再站姿做 8 组“吸 4 拍、呼 8 拍”。'
    },
    {
      id: 'P09', part: 9, no: '009', stage: 'basic', seconds: 300,
      title: '入门第九讲 如何正确有效的练习长音',
      summary: '长音是音色与气息的地基，本课讲练习顺序、音准和音色自检方法。',
      practice: '中音区每个音吹 8 拍，录音回听，标记最不稳的 2 个音。'
    },
    {
      id: 'P10', part: 10, no: '010', stage: 'basic', seconds: 334,
      title: '入门第十讲 五声音阶练习',
      summary: '用宫商角徵羽五声音阶做连贯性训练，强化指法与气息的配合。',
      practice: '五声音阶上下行各 5 遍，节拍器 60 BPM，一音一拍。'
    },
    {
      id: 'P11', part: 11, no: '011', stage: 'basic', seconds: 267,
      title: '入门第十一讲 玛丽有只小羊羔演奏讲解',
      summary: '用熟悉的短曲练习识谱、换指和乐句呼吸，完成第一首完整小曲。',
      practice: '分句慢练后完整连吹 3 遍，录音检查换指是否干净。'
    },
    {
      id: 'P12', part: 12, no: '012', stage: 'basic', seconds: 475,
      title: '入门第十二讲 欢乐颂演奏讲解',
      summary: '通过《欢乐颂》练习级进音型、节奏稳定和句尾收气。',
      practice: '60 BPM 逐句对齐节拍器，稳定后尝试 72 BPM。'
    },
    {
      id: 'P13', part: 13, no: '013', stage: 'basic', seconds: 408,
      title: '入门第十三讲 茉莉花演奏讲解',
      summary: '讲解《茉莉花》的连音、装饰和乐句呼吸，体会江南旋律的韵味。',
      practice: '先唱谱再吹奏，重点练句尾换气，录一版完整演奏。'
    },
    {
      id: 'P14', part: 14, no: '014', stage: 'basic', seconds: 600,
      title: '入门第十四讲 大鱼演奏讲解',
      summary: '用《大鱼》练习长线条气息和情绪起伏，衔接入门与流行曲演奏。',
      practice: '标出换气点，慢速连奏 2 遍，再跟原速伴奏试吹。'
    },
    {
      id: 'P15', part: 15, no: '015', stage: 'skill', seconds: 628,
      title: '进阶《长音》',
      summary: '进阶长音训练：强弱变化、音头音尾和音准控制，提升音色稳定性。',
      practice: '做“弱起—渐强—渐弱”长音，每音 12 拍，录 3 个音对比。'
    },
    {
      id: 'P16', part: 16, no: '016', stage: 'skill', seconds: 536,
      title: '进阶《长音》常见问题',
      summary: '汇总长音中的漏气、音尾下坠、音准偏高偏低等问题及纠正方法。',
      practice: '对照问题清单自检，选 2 个最明显的问题做 10 分钟专项练习。'
    },
    {
      id: 'P17', part: 17, no: '017', stage: 'skill', seconds: 771,
      title: '进阶《气震长音》',
      summary: '学习气震音的腹部发力与频率控制，让长音产生自然的波动。',
      practice: '在长音上做每秒 4–6 次气震，先慢后快，保持音高稳定。'
    },
    {
      id: 'P18', part: 18, no: '018', stage: 'skill', seconds: 339,
      title: '进阶《平直音与气震音、控制性气震音》',
      summary: '区分平直音、自然气震和控制性气震，讲清使用场景与切换方法。',
      practice: '同一长音做“平直 4 拍 → 气震 4 拍”切换 6 组。'
    },
    {
      id: 'P19', part: 19, no: '020', stage: 'skill', seconds: 505,
      title: '进阶《气息控制》演示',
      summary: '通过演示讲解强弱、长短、断连中的气息分配，提升乐句控制力。',
      practice: '用同一乐句做弱、中、强三种力度，保持音色不破。'
    },
    {
      id: 'P20', part: 20, no: '021', stage: 'skill', seconds: 539,
      title: '进阶《循环换气》理论讲解',
      summary: '讲解循环换气的原理：鼻吸口吐、口腔存气和喉部配合。',
      practice: '先练“口腔挤气”吹纸片 5 分钟，再尝试在长音中换气。'
    },
    {
      id: 'P21', part: 21, no: '022', stage: 'skill', seconds: 339,
      title: '进阶《循环换气》实际运用',
      summary: '把循环换气带入长音和旋律，讲解常见失败原因与练习步骤。',
      practice: '在 8 拍长音上尝试 1 次循环换气，连续成功 5 组。'
    },
    {
      id: 'P22', part: 22, no: '023', stage: 'skill', seconds: 612,
      title: '进阶《五声音阶》',
      summary: '进阶五声音阶练习，加入连吐、强弱和速度变化，强化手指均匀度。',
      practice: '五声音阶连奏 4 遍，节拍器从 60 提到 80 BPM。'
    },
    {
      id: 'P23', part: 23, no: '025', stage: 'skill', seconds: 574,
      title: '进阶《活指练习》',
      summary: '活指练习提升手指独立性和速度，讲解抬指高度与放松要领。',
      practice: '慢速活指 5 分钟，再逐步加速，保持指尖弹性、手腕不僵。'
    },
    {
      id: 'P24', part: 24, no: '027', stage: 'skill', seconds: 260,
      title: '进阶《赠音》',
      summary: '学习赠音的加花位置和时值控制，让句尾更有韵味。',
      practice: '在长音句尾加赠音，每种指法练 10 次，注意轻巧不抢拍。'
    },
    {
      id: 'P25', part: 25, no: '029', stage: 'skill', seconds: 385,
      title: '进阶《波音》',
      summary: '波音的快速交替与均匀度训练，讲解常见的“糊音”问题。',
      practice: '每个音做 4 次波音，先用 60 BPM 慢练，再恢复原速。'
    },
    {
      id: 'P26', part: 26, no: '030', stage: 'skill', seconds: 299,
      title: '进阶《打音》',
      summary: '打音用于强调音头和分隔同音，本课示范手指发力与回弹。',
      practice: '在同音反复处加打音，练 3 组，每组 8 小节。'
    },
    {
      id: 'P27', part: 27, no: '031', stage: 'skill', seconds: 833,
      title: '进阶《长颤音》',
      summary: '长颤音的气息与手指配合，讲清频率、幅度和收尾控制。',
      practice: '选 2 个音做 8 拍长颤，先慢频后加快，保持音准。'
    },
    {
      id: 'P28', part: 28, no: '032', stage: 'skill', seconds: 805,
      title: '进阶《短颤音》',
      summary: '短颤音的快速启动与均匀收束，常用于情绪高点。',
      practice: '短颤音每组 4 拍，连续 6 组，录音检查密度是否一致。'
    },
    {
      id: 'P29', part: 29, no: '033', stage: 'skill', seconds: 639,
      title: '进阶《欢乐歌》片段',
      summary: '以《欢乐歌》片段综合运用颤音、赠音和连吐，体会江南丝竹风格。',
      practice: '分段慢练片段，标出所有装饰音，再连贯演奏。'
    },
    {
      id: 'P30', part: 30, no: '034', stage: 'skill', seconds: 504,
      title: '进阶《滑音》',
      summary: '上滑音、下滑音的气息与指孔开合控制，让旋律连接更顺滑。',
      practice: '做三度滑音上下行各 10 次，保持滑动过程均匀无断点。'
    },
    {
      id: 'P31', part: 31, no: '035', stage: 'skill', seconds: 328,
      title: '进阶《圆滑音》',
      summary: '圆滑音（抹音）用于柔化音程连接，讲解手指抹动的幅度和速度。',
      practice: '在慢速音阶中加入圆滑音，每个连接练 8 次。'
    },
    {
      id: 'P32', part: 32, no: '036', stage: 'skill', seconds: 327,
      title: '进阶《剁音》',
      summary: '剁音以快速有力的手指击打制造顿挫感，本课讲发力与节拍位置。',
      practice: '每拍一个剁音，60 BPM 练 16 小节，注意不抢拍。'
    },
    {
      id: 'P33', part: 33, no: '037', stage: 'skill', seconds: 125,
      title: '进阶《飞指》',
      summary: '飞指是快速音阶跑动的技巧，强调手指放松和气流连贯。',
      practice: '从 60 BPM 起做四音一组飞指，逐步加速 10 BPM。'
    },
    {
      id: 'P34', part: 34, no: '039', stage: 'skill', seconds: 455,
      title: '进阶《历音》',
      summary: '历音为快速级进滑奏，讲解起音、收尾和气息支持。',
      practice: '上下历音各 10 次，先慢后快，保持每个音清晰。'
    },
    {
      id: 'P35', part: 35, no: '040', stage: 'skill', seconds: 133,
      title: '进阶《轮指》',
      summary: '轮指通过手指交替快速按孔形成连续音效果，练习均匀与放松。',
      practice: '轮指慢练 5 分钟，再逐步提速，手腕保持稳定。'
    },
    {
      id: 'P36', part: 36, no: '041', stage: 'skill', seconds: 540,
      title: '进阶《筒音作1、3、6指法》',
      summary: '学习筒音作 1、3、6 三种指法，扩展转调和曲目适配能力。',
      practice: '每种指法吹一遍五声音阶，记录最容易混淆的指法。'
    },
    {
      id: 'P37', part: 37, no: '042', stage: 'skill', seconds: 555,
      title: '进阶《半音阶》',
      summary: '半音阶训练覆盖全部半音位置，提升音准和转调能力。',
      practice: '半音阶上下行慢练 2 遍，用调音器抽查 5 个音。'
    },
    {
      id: 'P38', part: 38, no: '043', stage: 'skill', seconds: 570,
      title: '进阶《单吐》讲解',
      summary: '单吐的舌位、气流和“吐—苦”口型，解决起音含糊。',
      practice: '单吐四分音符 60 BPM 练 5 分钟，再练八分音符。'
    },
    {
      id: 'P39', part: 39, no: '044', stage: 'skill', seconds: 404,
      title: '进阶《单吐》练习、拓展',
      summary: '单吐在音阶与旋律中的应用，加入重音和强弱变化。',
      practice: '用单吐吹五声音阶，每音 2 拍，保持颗粒感。'
    },
    {
      id: 'P40', part: 40, no: '045', stage: 'skill', seconds: 247,
      title: '进阶《双吐》讲解',
      summary: '双吐“吐苦吐苦”的舌位与速度控制，是快速吐音的基础。',
      practice: '先无笛练“吐苦”2 分钟，再上笛做 60 BPM 八分音符。'
    },
    {
      id: 'P41', part: 41, no: '046', stage: 'skill', seconds: 420,
      title: '进阶《双吐》练习',
      summary: '双吐的均匀度与耐力训练，逐步应用到快速乐句。',
      practice: '双吐十六分音符 4 小节 × 6 组，速度从 60 到 80 BPM。'
    },
    {
      id: 'P42', part: 42, no: '048', stage: 'skill', seconds: 226,
      title: '进阶《花舌》',
      summary: '花舌（打嘟噜）的舌尖振动方法，常用于热烈欢快的段落。',
      practice: '先练“嘟噜”口型 3 分钟，再在长音上维持 4 拍。'
    },
    {
      id: 'P43', part: 43, no: '049', stage: 'skill', seconds: 258,
      title: '进阶《循环双吐》',
      summary: '循环双吐结合循环换气与双吐，用于连续快速吐音。',
      practice: '在双吐练习中尝试 1 次循环换气，成功后延长到 8 拍。'
    },
    {
      id: 'P44', part: 44, no: '050', stage: 'theory', seconds: 71,
      title: '《铁血丹心》竹笛演奏欣赏',
      summary: '完整演奏欣赏，可观察气息、装饰音和乐句处理。',
      practice: '听 2 遍，记下 3 个喜欢的处理，尝试模仿其中一句。'
    },
    {
      id: 'P45', part: 45, no: '051', stage: 'theory', seconds: 76,
      title: '《好春光》竹笛演奏欣赏',
      summary: '轻快风格的演奏示范，注意吐音和节奏弹性。',
      practice: '先跟唱旋律，再用单吐慢速模仿主题句。'
    },
    {
      id: 'P46', part: 46, no: '052', stage: 'theory', seconds: 74,
      title: '《人间第一情》竹笛演奏欣赏',
      summary: '抒情曲目的音色与气息示范，适合体会长音和气震音。',
      practice: '选一句长音旋律，模仿演奏者的气震频率。'
    },
    {
      id: 'P47', part: 47, no: '056', stage: 'theory', seconds: 296,
      title: '进阶-理论《基本节奏型》',
      summary: '梳理常见节奏型和拍号，建立准确的时值概念。',
      practice: '任选 3 条节奏型，先打拍唱谱，再用单音吹奏。'
    },
    {
      id: 'P48', part: 48, no: '058', stage: 'theory', seconds: 221,
      title: '进阶-理论《演奏记号》',
      summary: '认识连音、吐音、装饰音、反复等常见演奏记号。',
      practice: '在自己的曲谱上圈出 5 个记号，并注明含义。'
    },
    {
      id: 'P49', part: 49, no: '059', stage: 'theory', seconds: 64,
      title: '进阶-理论《速度记号》',
      summary: '认识 Adagio、Andante、Allegro 等速度术语与节拍器对照。',
      practice: '用节拍器分别体验 60、80、120 BPM 下的同一乐句。'
    },
    {
      id: 'P50', part: 50, no: '060', stage: 'theory', seconds: 93,
      title: '进阶-理论《竹笛的调》',
      summary: '讲清笛子调性、筒音与曲目调号之间的关系。',
      practice: '查清自己笛子的调，写出筒音作 5 时的音阶。'
    },
    {
      id: 'P51', part: 51, no: '061', stage: 'theory', seconds: 500,
      title: '进阶-理论《竹笛转调》',
      summary: '转调的原理与常用指法选择，帮助为不同曲目换调。',
      practice: '用筒音作 2 和作 5 各吹一条音阶，比较指法差异。'
    },
    {
      id: 'P52', part: 52, no: '062', stage: 'pop', seconds: 525,
      title: '流行曲第一讲 全按作2指法教学',
      summary: '学习筒音作 2 指法，为流行曲和转调曲目做准备。',
      practice: '筒音作 2 五声音阶上下行 5 遍，标出易错指法。'
    },
    {
      id: 'P53', part: 53, no: '063', stage: 'pop', seconds: 799,
      title: '流行曲第二讲《大鱼》',
      summary: '用筒音作 2 演奏《大鱼》，讲解换气、连音和情绪推进。',
      practice: '分段慢练主歌和副歌，标好换气点后完整连奏。'
    },
    {
      id: 'P54', part: 54, no: '065', stage: 'pop', seconds: 768,
      title: '流行曲第四讲《渡情》',
      summary: '《渡情》的旋律处理与装饰音运用，练习乐句呼应。',
      practice: '先唱后吹，重点练句尾收气和滑音连接。'
    },
    {
      id: 'P55', part: 55, no: '066', stage: 'pop', seconds: 816,
      title: '流行曲第五讲《红颜旧》',
      summary: '抒情流行曲的气息与音色控制，学习弱起和渐强。',
      practice: '用弱起练习第一句，录音对比强弱层次。'
    },
    {
      id: 'P56', part: 56, no: '067', stage: 'pop', seconds: 707,
      title: '流行曲第六讲《痴情冢》',
      summary: '讲解《痴情冢》的节奏与情感处理，加入气震和滑音。',
      practice: '慢速通曲 2 遍，单独练 3 处装饰音。'
    },
    {
      id: 'P57', part: 57, no: '068', stage: 'pop', seconds: 740,
      title: '流行曲第七讲《无羁》',
      summary: '《无羁》的旋律线条与高音控制，练习气息支撑。',
      practice: '高音句单独练 10 分钟，保持肩颈放松。'
    },
    {
      id: 'P58', part: 58, no: '070', stage: 'pop', seconds: 926,
      title: '流行曲第九讲《人间第一情》',
      summary: '完整讲解《人间第一情》的演奏处理和段落层次。',
      practice: '全曲分段练习后连奏，录一版完整演奏。'
    },
    {
      id: 'P59', part: 59, no: '072', stage: 'solo', seconds: 836,
      title: '独奏曲《牧民新歌》2',
      summary: '《牧民新歌》第二段，讲解草原风格的节奏和装饰音；合集从第 2 段开始收录。',
      practice: '慢练本段 3 遍，标出换气与装饰音位置。'
    },
    {
      id: 'P60', part: 60, no: '073', stage: 'solo', seconds: 201,
      title: '独奏曲《牧民新歌》3',
      summary: '第三段旋律与技巧衔接，注意快速指法和吐音。',
      practice: '拆成 2 小节一组慢练，再逐步合并。'
    },
    {
      id: 'P61', part: 61, no: '074', stage: 'solo', seconds: 373,
      title: '独奏曲《牧民新歌》4',
      summary: '第四段的情绪推进与力度层次。',
      practice: '用节拍器慢练，重点做渐强和句尾收束。'
    },
    {
      id: 'P62', part: 62, no: '075', stage: 'solo', seconds: 378,
      title: '独奏曲《牧民新歌》5',
      summary: '第五段的华彩与快速跑句处理。',
      practice: '选最难的 4 小节循环慢练 10 分钟。'
    },
    {
      id: 'P63', part: 63, no: '076', stage: 'solo', seconds: 693,
      title: '独奏曲《牧民新歌》6',
      summary: '末段与全曲串联，讲整体结构和演奏呼吸。',
      practice: '全曲连奏 1 遍，标记断点后再分句补练。'
    },
    {
      id: 'P64', part: 64, no: '078', stage: 'solo', seconds: 618,
      title: '独奏曲《西湖春晓》2',
      summary: '《西湖春晓》第二段，江南风格的气息与连音处理。',
      practice: '慢速连音练习，保持音与音之间无缝。'
    },
    {
      id: 'P65', part: 65, no: '079', stage: 'solo', seconds: 319,
      title: '独奏曲《西湖春晓》3',
      summary: '第三段的装饰音与乐句呼吸。',
      practice: '单独练装饰音 10 分钟，再合入乐句。'
    },
    {
      id: 'P66', part: 66, no: '080', stage: 'solo', seconds: 285,
      title: '独奏曲《西湖春晓》4',
      summary: '第四段的节奏变化与情绪转折。',
      practice: '先打拍唱谱，再上笛慢练。'
    },
    {
      id: 'P67', part: 67, no: '081', stage: 'solo', seconds: 893,
      title: '独奏曲《西湖春晓》5',
      summary: '末段与全曲整合，讲音色统一和收尾。',
      practice: '全曲连奏 2 遍，录音自评。'
    },
    {
      id: 'P68', part: 68, no: '082', stage: 'solo', seconds: 324,
      title: '独奏曲《扬鞭催马运粮忙》1',
      summary: '北方风格独奏曲开篇，讲快速吐音和热烈情绪。',
      practice: '单吐主题句 10 分钟，先慢后快。'
    },
    {
      id: 'P69', part: 69, no: '083', stage: 'solo', seconds: 784,
      title: '独奏曲《扬鞭催马运粮忙》2',
      summary: '第二段的双吐与快速跑句。',
      practice: '双吐 4 小节循环，60→80 BPM。'
    },
    {
      id: 'P70', part: 70, no: '084', stage: 'solo', seconds: 1109,
      title: '独奏曲《扬鞭催马运粮忙》3',
      summary: '第三段的技巧综合与段落衔接。',
      practice: '分段慢练，标注所有换气点。'
    },
    {
      id: 'P71', part: 71, no: '085', stage: 'solo', seconds: 614,
      title: '独奏曲《扬鞭催马运粮忙》4',
      summary: '末段与全曲演奏，讲耐力和情绪收放。',
      practice: '全曲连奏 1 遍，重点练最后 8 小节。'
    },
    {
      id: 'P72', part: 72, no: '086', stage: 'solo', seconds: 569,
      title: '独奏曲《姑苏行》1',
      summary: '《姑苏行》开篇，江南丝竹的韵味与气息。',
      practice: '长音与连音慢练，模仿示范的音色。'
    },
    {
      id: 'P73', part: 73, no: '087', stage: 'solo', seconds: 814,
      title: '独奏曲《姑苏行》2',
      summary: '第二段的装饰音与乐句起伏。',
      practice: '逐句模仿，重点练赠音和波音。'
    },
    {
      id: 'P74', part: 74, no: '088', stage: 'solo', seconds: 619,
      title: '独奏曲《姑苏行》3',
      summary: '第三段的节奏与情绪推进。',
      practice: '慢速通段 2 遍，标出难点小节。'
    },
    {
      id: 'P75', part: 75, no: '089', stage: 'solo', seconds: 591,
      title: '独奏曲《姑苏行》4',
      summary: '末段与全曲串联，讲整体气息安排。',
      practice: '全曲连奏并录音，找出最弱的一段补练。'
    },
    {
      id: 'P76', part: 76, no: '090', stage: 'solo', seconds: 447,
      title: '独奏曲《春到湘江》1',
      summary: '《春到湘江》开篇，湖南风格与快板技巧。',
      practice: '主题句慢练，注意吐音清晰度。'
    },
    {
      id: 'P77', part: 77, no: '091', stage: 'solo', seconds: 503,
      title: '独奏曲《春到湘江》2',
      summary: '第二段的快速指法与节奏变化。',
      practice: '难点 2 小节循环，节拍器逐级加速。'
    },
    {
      id: 'P78', part: 78, no: '092', stage: 'solo', seconds: 459,
      title: '独奏曲《春到湘江》3',
      summary: '第三段的技巧综合与力度对比。',
      practice: '分段练强弱对比，录一版对比听。'
    },
    {
      id: 'P79', part: 79, no: '093', stage: 'solo', seconds: 1154,
      title: '独奏曲《春到湘江》4',
      summary: '第四段的长段演奏与耐力训练。',
      practice: '分段循环，每段连续 3 遍不中断。'
    },
    {
      id: 'P80', part: 80, no: '094', stage: 'solo', seconds: 1018,
      title: '独奏曲《春到湘江》5',
      summary: '末段与全曲整合，完成整套课程的最后冲刺。',
      practice: '全曲完整演奏 2 遍，写一份结课复盘。'
    }
  ]
};

if (typeof window !== 'undefined') window.COURSE = COURSE;
if (typeof module !== 'undefined' && module.exports) module.exports = COURSE;
