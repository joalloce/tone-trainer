// Builds src/data/syllables.json: syllable + tone -> characters that say it.
//
// Only characters with exactly one reading (tones 1-4) are kept, so browser
// speech synthesis can't pick a different pronunciation (e.g. 好 hǎo/hào).
//
// Run with: pnpm data
import { writeFileSync } from 'node:fs'
import { pinyin } from 'pinyin-pro'

// Common characters, in priority order: the first characters found for a
// syllable + tone are the ones the quiz uses.
const CANDIDATES = [
  // Classic tone drill sets
  '妈麻马骂八拔把爸衣姨椅意屋无五雾鱼雨玉汤糖躺烫书熟鼠树飞肥匪费哥格各天田舔',
  // HSK 1-2 vocabulary
  '你好谢再见对不起没关系请是我他她们的客气很这那什么一二三四五六七八九十今天明昨现在年月日星期点分钟吃',
  '喝看听说写去来买学想要会能有做住叫读喜欢爸妈哥姐弟妹朋友老师同生医先小家孩子女儿人谁名字米饭水茶咖啡',
  '苹果菜面条鸡蛋牛奶杯店饿渴肉鱼包饺校院商中国北京前后里上下哪路左右旁边远热冷雨风太阳雪春夏秋冬云暖和',
  '凉快花树山河伞睡觉床工作打电话开车坐走跑步玩洗穿回班课唱歌跳舞游泳休息钱多少块贵便宜卖东西大个两本些',
  '给还可以衣服红白黑蓝绿黄漂亮高长短新旧慢忙累兴难容易爱早晚时间正已经就每百千第次件张公斤号元男妻丈夫',
  '它您务员身体眼睛病药瓜羊共汽自行船机场旅票房教室司门外离到进出向从近阴晴运动篮球踢笑帮助告诉答介绍希',
  '望得懂知道让送找完始准备迎问姓乐错真非常最颜色也吧着比为但所因别报纸考试题事情意思手表',
  // More common characters, to cover more syllables
  '安按班搬板半帮包饱抱杯北被本笨鼻比笔必边扁变标别冰兵饼波伯布猜才财采彩参餐草层查察拆柴产尝场抄超潮吵',
  '扯尘沉陈称成城池迟尺齿冲虫抽愁丑臭出初除楚川窗吹春纯词此聪粗醋村存寸搭达带代待袋戴担单胆淡当刀导岛倒',
  '道德灯低滴敌底地帝典掉钓丁顶订定丢冬冻洞抖斗豆毒独堵赌肚段断堆队吨蹲顿夺躲恩而耳发罚法帆翻凡烦反返犯',
  '泛范方防仿纺肺纷坟粉份奋愤丰封疯峰锋蜂逢佛否扶浮福府父付妇负附复富腹该改概干甘赶敢感刚钢岗港糕搞稿',
  '歌革隔根跟耕功攻供宫恭巩狗够构购姑孤古谷股骨鼓固故顾刮挂乖怪官观管馆惯光广逛归规鬼柜滚棍锅过哈海害含',
  '寒喊汉汗航毫豪号河荷盒贺恨恒横衡轰宏洪虹喉猴吼厚候呼忽胡壶湖糊虎互户护华滑化划画怀坏环换皇灰挥毁汇',
  '惠婚魂活火伙或货获祸积基激级极即急集几己挤计记纪技季既继寄加夹佳甲价驾架假尖坚肩艰监减剪简件建剑健',
  '渐践江将姜讲奖降交郊娇骄胶焦脚轿较阶接街节结解介戒届界借金津筋仅紧尽劲晋经惊精景警净竞敬静境镜究久',
  '酒救居局菊橘举巨句拒具俱剧据距聚卷决绝军君均菌俊凯刊康抗考烤靠科棵颗壳克刻肯坑空孔恐口扣哭苦库裤酷',
  '夸宽款狂况矿亏葵愧困扩拉啦辣懒烂狼朗浪捞劳牢老雷泪类梨李理礼力历立丽利例连帘莲联脸练恋链良粮亮辆量',
  '聊疗料列烈林临邻灵铃零龄领令另留流刘柳龙笼楼漏炉驴律虑乱轮论罗萝锣逻码买麦满猫毛矛冒帽贸眉梅煤美门',
  '猛梦迷秘密蜜眠棉免苗秒庙灭民敏命摸模膜摩磨魔末墨默谋某母亩木目牧墓慕暮拿纳耐南脑闹内嫩尼泥念娘鸟宁',
  '扭农弄怒挪诺欧偶爬怕拍排牌派盘判盼胖抛泡陪培赔配喷盆棚蓬篷鹏捧碰批皮疲脾匹屁片偏篇骗飘拼贫品平评凭',
  '瓶萍坡泼婆迫破扑铺葡普谱欺漆齐其奇骑棋旗企启弃器恰迁牵铅谦签钳潜浅遣欠枪腔强墙抢悄敲桥瞧巧切茄窃亲',
  '侵琴禽勤青轻倾清庆穷丘区曲驱渠取娶趣圈全权泉拳犬劝缺却确裙群然燃染嚷饶扰绕仁忍认任扔仍绒荣溶熔融柔',
  '如乳入软锐瑞润若弱撒洒萨赛散桑嗓丧扫嫂森杀沙纱傻晒删闪陕扇善伤赏尚烧梢稍勺绍哨舌蛇舍设社射涉摄申伸',
  '深神审婶肾甚渗慎升声牲绳省圣胜盛剩尸失诗施湿石识实拾食史使驶士氏世市示式侍势视饰适逝释收守首寿受兽',
  '售授瘦叔殊梳输蔬暑署蜀术束述竖数刷耍衰摔甩帅双霜爽税顺丝私斯撕死寺似饲松宋颂搜艘苏俗诉肃素速宿塑酸',
  '算虽随岁碎孙损笋缩索锁塔台抬态泰贪摊滩坛谈潭坦叹探唐堂塘涛掏逃桃陶淘讨套特疼腾梯提蹄替添甜填挑贴铁',
  '厅亭庭停挺通铜童统痛偷头投透突图徒涂途屠土吐兔团推腿退吞托拖脱驼妥拓挖蛙娃瓦歪弯湾丸顽挽碗万汪亡王',
  '网往忘旺危威微围违唯维伟伪尾委卫未位味畏胃喂温文纹闻蚊稳翁窝沃卧握乌污吴午伍武物误悟夕吸析牺悉惜稀',
  '溪熙锡习席袭戏细虾瞎峡狭霞吓仙纤鲜闲弦咸衔嫌显险县线限宪陷献乡相香箱详响享项巷象像橡削宵消销晓孝效',
  '歇协邪斜携鞋泄泻心辛欣薪信猩刑形型醒杏幸性凶兄胸雄熊修羞朽秀袖绣需虚徐许序叙续絮宣悬旋选靴血寻巡询',
  '循训讯迅压鸭牙芽崖哑雅亚烟淹延严言岩沿炎研盐演艳燕验央扬杨洋仰养氧样腰邀摇遥咬耀爷野业叶页夜液依仪',
  '移遗疑亿义艺忆议亦异役译益谊毅翼因音银引饮印英樱鹰盈营赢影硬映拥永勇用优忧悠尤由邮犹油又右幼娱渔愉',
  '愚与宇羽语育浴预域欲遇御裕愈园原圆援缘源怨愿约岳阅悦跃越匀允晕韵杂灾栽宰载咱暂赞脏葬遭糟枣澡灶造噪',
  '责则泽贼怎增赠扎炸摘窄债寨沾粘展占战站章掌丈仗帐账招召照罩遮折哲者浙针侦珍诊枕阵振镇震争征挣睁蒸整',
  '证政症之支汁芝枝织肢执直值职植殖止只旨址指至志制治质致秩智置忠终钟肿种众州舟周洲粥轴宙皱骤朱株珠猪',
  '竹烛逐主煮嘱注驻柱祝著筑抓专砖转赚庄装壮状追捉桌浊资姿紫宗综总纵奏租足族阻组祖钻嘴罪醉尊遵左座',
].join('')

const MAX_CHARS_PER_ITEM = 2

type Tone = 1 | 2 | 3 | 4
interface Entry {
  syllable: string
  tone: Tone
  hanzi: string[]
}

const entries = new Map<string, Entry>()
const skipped: string[] = []

for (const char of new Set(CANDIDATES)) {
  const readings = new Set(pinyin(char, { toneType: 'num', type: 'array', multiple: true }))
  const match = readings.size === 1 ? /^([a-zü]+)([1-4])$/.exec([...readings][0]) : null
  if (!match) {
    skipped.push(char)
    continue
  }
  const [id, syllable, toneDigit] = match
  const entry = entries.get(id) ?? { syllable, tone: Number(toneDigit) as Tone, hanzi: [] }
  if (entry.hanzi.length < MAX_CHARS_PER_ITEM) entry.hanzi.push(char)
  entries.set(id, entry)
}

const sorted = [...entries.values()].sort(
  (a, b) => a.syllable.localeCompare(b.syllable) || a.tone - b.tone,
)
writeFileSync(
  new URL('../src/data/syllables.json', import.meta.url),
  '[\n' + sorted.map((e) => '  ' + JSON.stringify(e)).join(',\n') + '\n]\n',
)

const syllables = new Set(sorted.map((e) => e.syllable))
const allFour = [...syllables].filter((s) => sorted.filter((e) => e.syllable === s).length === 4)
const perTone = [1, 2, 3, 4].map((t) => sorted.filter((e) => e.tone === t).length)
console.log(`${sorted.length} items, ${syllables.size} syllables, ${allFour.length} with all four tones`)
console.log(`Items per tone: ${perTone.join(' / ')}`)
console.log(`Skipped ${skipped.length} characters with several readings or a neutral tone`)
