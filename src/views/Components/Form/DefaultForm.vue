<script setup lang="tsx">
import { Form } from '@/components/Form'
import { reactive, computed, ref } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { ContentWrap } from '@/components/ContentWrap'
import { useAppStore } from '@/store/modules/app'
import { FormSchema } from '@/components/Form'
import { ElMessage, ElMessageBox } from 'element-plus'
import { BaseButton } from '@/components/Button'

const appStore = useAppStore()

const { t } = useI18n()

const isMobile = computed(() => appStore.getMobile)

const imageUrl = ref('')

const schema = reactive<FormSchema[]>([
  {
    field: 'field82',
    component: 'Divider',
    label: `${t('formDemo.upload')}`
  },
  {
    field: 'field83',
    component: 'Upload',
    label: `${t('formDemo.default')}`,
    componentProps: {
      limit: 5,
      action: 'https://run.mocky.io/v3/ce48ae34-3cb6-434d-a56f-2dd3973ed104',
      fileList: [
        {
          name: 'element-plus-logo.svg',
          url: 'https://element-plus.org/images/element-plus-logo.svg'
        }
      ],
      multiple: true,
      onPreview: (uploadFile) => {
        console.log(uploadFile)
      },
      onRemove: (file) => {
        console.log(file)
      },
      beforeRemove: (uploadFile) => {
        return ElMessageBox.confirm(`Cancel the transfer of ${uploadFile.name} ?`).then(
          () => true,
          () => false
        )
      },
      onExceed: (files, uploadFiles) => {
        ElMessage.warning(
          `The limit is 3, you selected ${files.length} files this time, add up to ${
            files.length + uploadFiles.length
          } totally`
        )
      },
      slots: {
        default: () => <BaseButton type="primary">Click to upload</BaseButton>,
        tip: () => <div class="el-upload__tip">jpg/png files with a size less than 500KB.</div>
      }
    }
  }
])
</script>

<template>
  <ContentWrap :title="t('formDemo.defaultForm')" :message="t('formDemo.formDes')">
    <Form :schema="schema" label-width="auto" :label-position="isMobile ? 'top' : 'right'" />
  </ContentWrap>
</template>

<style lang="less">
.transfer-footer {
  padding: 6px 5px;
  margin-left: 15px;
}

.el-upload:hover {
  border-color: var(--el-color-primary);
}
</style>
