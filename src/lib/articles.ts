export interface Article {
  title: string;
  date: string;
  slug: string;
  excerpt: string;
  pages: number;
  source: string;
}

// Article metadata from PDF conversion
export const articles: Article[] = [
  {
    title: "AIDC大爆发",
    date: "2026-05-14",
    slug: "aidc大爆发",
    excerpt: "AIDC板块近期上涨短期催化明确：电力设备出海、AIDC相关标的涨幅较好，川普访华为重要催化，其随行人员包含英伟达、Meta、特斯拉等重磅嘉宾，释放中美在AIDC领域加强合作的信号...",
    pages: 3,
    source: "AIDC大爆发20260514.pdf",
  },
  {
    title: "AI材料产业链再推荐",
    date: "2026-05-13",
    slug: "ai材料产业链再推荐",
    excerpt: "PCB化学品属于PCB产业链中游环节，上游对应硫酸、盐酸等基础化工原材料，下游直接对接PCB生产厂商。当前PCB下游行业景气度向好，上游PCB化学品景气度也有望随之提升...",
    pages: 2,
    source: "AI材料产业链再推荐20260513.pdf",
  },
  {
    title: "Agent架构变革的起点",
    date: "2026-05-13",
    slug: "agent架构变革的起点",
    excerpt: "Agent架构的演进可用'打水漂'比喻阐释：行业发展会出现多个技术弹射点，首个弹射点为OpenCloud，第二个是当前行业热点Hermes，后续还将有更多架构创新涌现...",
    pages: 3,
    source: "Agent架构变革的起点20260513.pdf",
  },
  {
    title: "Token经济学新模式是怎样运行的？",
    date: "2026-05-14",
    slug: "token经济学新模式是怎样运行的",
    excerpt: "Token是全新商业模式的计量单位，生产端以大规模GPU算力集群为底座，由大模型厂商生成。Token分销/代理平台属于流通端商业环节，核心模式是向上游大模型厂商批量采购Token...",
    pages: 1,
    source: "Token经济学新模式是怎样运行的？20260514.pdf",
  },
  {
    title: "半导体设备订单超预期，重视上游零部件受益海外+国内景气度提前释放",
    date: "2026-05-14",
    slug: "半导体设备订单超预期-重视上游零部件受益海外-国内景气度提前释放",
    excerpt: "国产半导体设备仍有四倍以上扩产空间，景气度高企下行业格局将持续向头部集中，下游客户目前更关注设备交付情况。存储设备板块当前行情表现亮眼，核心驱动因素为2026年二三季度下游头部存储客户订单加速释放...",
    pages: 1,
    source: "半导体设备订单超预期，重视上游零部件受益海外+国内景气度提前释放20260514.pdf",
  },
];
