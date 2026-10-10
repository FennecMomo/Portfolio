import type { CollectionConfig, Field, GlobalConfig } from 'payload'
import { authenticated, publicContent, safeURL, slugValid } from '../lib/access'
import { archiveRoot, mediaRoot, siteURL } from '../lib/paths'
import { prepareDemo } from '../lib/demo-archive'

const permissions = { create: authenticated, update: authenticated, delete: authenticated }
const publishing: Field[] = [
  {
    name: 'visibility',
    label: '可见性',
    type: 'select',
    required: true,
    defaultValue: 'public',
    options: [
      { label: '公开', value: 'public' },
      { label: '不公开', value: 'private' },
    ],
    admin: {
      position: 'sidebar',
      description: '不公开的内容不会出现在前台、公开 API 或关联下载中。',
    },
  },
]
export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: '管理员', plural: '管理员' },
  auth: {
    tokenExpiration: 7200,
    maxLoginAttempts: 5,
    lockTime: 600000,
    cookies: { sameSite: 'Lax', secure: process.env.NODE_ENV === 'production' },
  },
  admin: { useAsTitle: 'email', group: '系统' },
  access: { ...permissions, read: authenticated },
  fields: [{ name: 'name', label: '姓名', type: 'text' }],
}
export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: '媒体与附件', plural: '媒体与附件' },
  admin: { useAsTitle: 'alt', group: '内容' },
  access: { ...permissions, read: ({ req }) => (req.user ? true : { public: { equals: true } }) },
  upload: {
    staticDir: mediaRoot,
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
      'application/zip',
      'application/x-zip-compressed',
      'text/plain',
    ],
    imageSizes: [{ name: 'card', width: 900, height: 600, position: 'centre' }],
    adminThumbnail: 'card',
  },
  fields: [
    { name: 'alt', label: '名称 / 图片替代文字', type: 'text', required: true },
    {
      name: 'public',
      label: '允许公开访问',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          '草稿素材默认不公开。作品发布前，请将需要展示或下载的媒体设为公开。公开素材持有地址即可访问。',
      },
    },
    { name: 'caption', label: '说明', type: 'textarea' },
  ],
}
export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: { singular: '作品', plural: '作品' },
  admin: {
    useAsTitle: 'title',
    group: '内容',
    defaultColumns: ['title', 'projectStatus', '_status', 'updatedAt'],
    preview: (doc) => `${siteURL()}/preview/${doc.slug}`,
  },
  access: { ...permissions, read: publicContent },
  versions: { drafts: { autosave: { interval: 1500 } }, maxPerDoc: 30 },
  fields: [
    { name: 'title', label: '作品名称', type: 'text', required: true },
    {
      name: 'slug',
      label: '网址标识',
      type: 'text',
      unique: true,
      required: true,
      validate: slugValid,
      index: true,
    },
    { name: 'summary', label: '一句话介绍', type: 'textarea', required: true, maxLength: 240 },
    { name: 'body', label: '详细介绍', type: 'richText' },
    {
      name: 'cover',
      label: '封面',
      type: 'upload',
      relationTo: 'media',
      filterOptions: { mimeType: { contains: 'image/' } },
    },
    {
      name: 'gallery',
      label: '作品截图',
      type: 'array',
      labels: { singular: '截图', plural: '截图' },
      fields: [
        {
          name: 'image',
          label: '图片',
          type: 'upload',
          relationTo: 'media',
          required: true,
          filterOptions: { mimeType: { contains: 'image/' } },
        },
      ],
    },
    { name: 'category', label: '作品类型', type: 'text', required: true, defaultValue: '其他' },
    {
      name: 'tags',
      label: '技术标签',
      type: 'array',
      labels: { singular: '标签', plural: '标签' },
      fields: [{ name: 'label', label: '标签', type: 'text', required: true }],
    },
    {
      name: 'projectStatus',
      label: '项目状态',
      type: 'select',
      defaultValue: 'developing',
      options: [
        { label: '开发中', value: 'developing' },
        { label: '已发布', value: 'released' },
        { label: '维护中', value: 'maintaining' },
        { label: '已完成', value: 'completed' },
        { label: '已暂停', value: 'paused' },
        { label: '已归档', value: 'archived' },
      ],
    },
    {
      name: 'legacyStatus',
      label: '原始状态备注',
      type: 'text',
      admin: { description: '保留历史状态，例如待找回、待合并、重构中。' },
    },
    { name: 'completion', label: '完成度（可选）', type: 'number', min: 0, max: 100 },
    { name: 'showProgress', label: '前台显示完成度', type: 'checkbox', defaultValue: false },
    {
      name: 'projectUpdatedAt',
      label: '项目最近更新日期',
      type: 'date',
      admin: { date: { pickerAppearance: 'dayOnly' } },
    },
    {
      name: 'featured',
      label: '精选作品',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'sortOrder',
      label: '推荐顺序（较小优先）',
      type: 'number',
      defaultValue: 100,
      admin: { position: 'sidebar' },
    },
    {
      name: 'links',
      label: '相关链接',
      type: 'array',
      labels: { singular: '链接', plural: '链接' },
      fields: [
        {
          name: 'kind',
          label: '类型',
          type: 'select',
          required: true,
          options: [
            { label: '在线体验', value: 'live' },
            { label: '源码仓库', value: 'source' },
            { label: '发布版本', value: 'release' },
            { label: '演示视频', value: 'video' },
            { label: '网站', value: 'website' },
          ],
        },
        { name: 'label', label: '按钮名称（可选）', type: 'text' },
        { name: 'url', label: '地址', type: 'text', required: true, validate: safeURL },
      ],
    },
    {
      name: 'downloads',
      label: '下载附件',
      type: 'array',
      labels: { singular: '附件', plural: '附件' },
      fields: [
        { name: 'label', label: '名称 / 版本', type: 'text', required: true },
        { name: 'file', label: '文件', type: 'upload', relationTo: 'media', required: true },
      ],
    },
    {
      name: 'activeDemo',
      label: '发布的在线 Demo',
      type: 'relationship',
      relationTo: 'demos',
      maxDepth: 0,
      admin: {
        description: '先在 Demo 库上传验证并预览，再选择版本并发布作品。替换此关联可回退旧版本。',
      },
    },
    ...publishing,
  ],
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        if (data.activeDemo) {
          const id = typeof data.activeDemo === 'object' ? data.activeDemo.id : data.activeDemo
          const demo = await req.payload.findByID({ collection: 'demos', id, req })
          if (demo.validation !== 'ready') throw new Error('只能发布已验证的 Demo')
        }
        return data
      },
    ],
  },
}
export const Plans: CollectionConfig = {
  slug: 'plans',
  labels: { singular: '开发计划', plural: '开发计划' },
  admin: { useAsTitle: 'title', group: '内容' },
  access: { ...permissions, read: publicContent },
  versions: { drafts: true, maxPerDoc: 20 },
  fields: [
    { name: 'title', label: '标题', type: 'text', required: true },
    { name: 'description', label: '说明', type: 'textarea' },
    {
      name: 'status',
      label: '进展',
      type: 'select',
      defaultValue: 'todo',
      required: true,
      options: [
        { label: '计划中', value: 'todo' },
        { label: '进行中', value: 'doing' },
        { label: '已完成', value: 'done' },
      ],
    },
    {
      name: 'targetDate',
      label: '目标日期（可选）',
      type: 'date',
      admin: { date: { pickerAppearance: 'dayOnly' } },
    },
    { name: 'project', label: '关联作品', type: 'relationship', relationTo: 'projects' },
    ...publishing,
  ],
}
export const Demos: CollectionConfig = {
  slug: 'demos',
  labels: { singular: 'Demo 版本', plural: 'Demo 版本' },
  admin: {
    useAsTitle: 'title',
    group: '内容',
    description:
      '每次上传创建一个独立版本。已有版本不能替换文件。验证完成后，可预览并在作品中选为发布版本。',
    preview: (doc) => `${siteURL()}/preview-demo/${doc.id}`,
  },
  access: { create: authenticated, read: authenticated, update: () => false, delete: () => false },
  upload: {
    staticDir: archiveRoot,
    mimeTypes: ['application/zip', 'application/x-zip-compressed'],
    disableLocalStorage: false,
  },
  fields: [
    { name: 'title', label: '版本名称', type: 'text', required: true },
    {
      name: 'validation',
      label: '验证状态',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: '待验证', value: 'pending' },
        { label: '可发布', value: 'ready' },
        { label: '验证失败', value: 'failed' },
      ],
      admin: { readOnly: true },
      access: { create: () => false, update: () => false },
    },
    {
      name: 'validationMessage',
      label: '验证结果',
      type: 'textarea',
      admin: { readOnly: true },
      access: { create: () => false, update: () => false },
    },
    {
      name: 'entryRoot',
      type: 'text',
      admin: { hidden: true },
      access: { create: () => false, update: () => false, read: ({ req }) => Boolean(req.user) },
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, req, operation, context }) => {
        if (operation !== 'create' || context.demoPrepared) return doc
        let result
        try {
          const root = await prepareDemo(doc.id, doc.filename)
          result = {
            validation: 'ready' as const,
            entryRoot: root,
            validationMessage: '验证通过。可使用预览按钮检查，再关联到作品并发布。',
          }
        } catch (error) {
          result = {
            validation: 'failed' as const,
            validationMessage: error instanceof Error ? error.message : '无效 ZIP',
          }
        }
        return req.payload.update({
          collection: 'demos',
          id: doc.id,
          data: result,
          overrideAccess: true,
          req,
          context: { demoPrepared: true },
        })
      },
    ],
  },
}
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: '站点资料',
  admin: { group: '系统' },
  access: { read: () => true, update: authenticated },
  fields: [
    { name: 'name', label: '显示名称', type: 'text', required: true, defaultValue: '狐漠漠' },
    {
      name: 'intro',
      label: '首页介绍',
      type: 'textarea',
      defaultValue: '全栈开发者 · 游戏制作人 · 业余写手。',
    },
    { name: 'about', label: '关于我', type: 'richText' },
    { name: 'avatar', label: '头像', type: 'upload', relationTo: 'media' },
    {
      name: 'skills',
      label: '技能',
      type: 'array',
      fields: [{ name: 'label', type: 'text', label: '技能', required: true }],
    },
    {
      name: 'contacts',
      label: '联系方式',
      type: 'array',
      fields: [
        { name: 'label', label: '名称', type: 'text', required: true },
        {
          name: 'url',
          label: '网址或 mailto 邮箱',
          type: 'text',
          required: true,
          validate: (v: unknown) =>
            String(v).startsWith('mailto:')
              ? !/[\r\n]/.test(String(v)) || '无效邮箱地址'
              : safeURL(v),
        },
      ],
    },
    { name: 'showPlans', label: '显示开发计划栏目', type: 'checkbox', defaultValue: true },
  ],
}
