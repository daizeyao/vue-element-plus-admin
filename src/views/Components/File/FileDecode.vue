<script setup lang="tsx">
import { Form } from '@/components/Form'
import { reactive, computed, ref } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { ContentWrap } from '@/components/ContentWrap'
import { useAppStore } from '@/store/modules/app'
import { FormSchema } from '@/components/Form'
import { ElInput, ElFormItem, ElMessage, ElMessageBox, ElUpload } from 'element-plus'
import { BaseButton } from '@/components/Button'
import { useForm } from '@/hooks/web/useForm'
import { decodeApi } from '@/api/file'
import { KeyType } from '@/api/file/types'
import { useValidator } from '@/hooks/web/useValidator'
import { CONTENT_TYPE } from '@/constants'

const appStore = useAppStore()

const { t } = useI18n()

const isMobile = computed(() => appStore.getMobile)

const imageUrl = ref('')

const loading = ref(false)

const { required } = useValidator()
const rules = {
  key: [required()]
}

const { formRegister, formMethods } = useForm()
const { getFormData, getElFormExpose, setValues, getComponentExpose } = formMethods

const schema = reactive<FormSchema[]>([
  {
    field: 'upload',
    component: 'Upload',
    colProps: {
      span: 24
    },
    componentProps: {
      limit: 1,
      action: 'http://localhost:3006/upload',
      fileList: [],
      multiple: true,
      // onPreview: (uploadFile) => {
      //   console.log(uploadFile)
      // },
      // onRemove: (file) => {
      //   console.log(file)
      // },
      beforeRemove: (uploadFile) => {
        return ElMessageBox.confirm(`Cancel the transfer of ${uploadFile.name} ?`).then(
          () => true,
          () => false
        )
      },
      onExceed: (files, uploadFiles) => {
        ElMessage.warning(
          `The limit is 1, you selected ${files.length} files this time, add up to ${
            files.length + uploadFiles.length
          } totally`
        )
      },
      // onSuccess: (response, file, fileList) => {
      // console.log(response)
      // },
      slots: {
        default: () => <BaseButton type="primary">{t('fileDemo.uploadClick')}</BaseButton>,
        tip: () => <div class="el-upload__tip">{t('fileDemo.uploadTip')}</div>
      }
    }
  },
  {
    field: 'key',
    label: t('fileDemo.key'),
    component: 'Input',
    colProps: {
      span: 8
    },
    componentProps: {
      placeholder: '请输入密钥'
    }
  },
  {
    field: 'decode',
    colProps: {
      span: 24
    },
    formItemProps: {
      slots: {
        default: () => {
          return (
            <>
              <div class="w-[5%]">
                <BaseButton
                  class="w-[100%]"
                  type="primary"
                  onClick={fileDecode}
                  loading={loading.value}
                >
                  {t('fileDemo.decode')}
                </BaseButton>
              </div>
            </>
          )
        }
      }
    }
  }
])

const fileDecode = async () => {
  const formRef = await getElFormExpose()
  await formRef?.validate(async (isValid) => {
    if (isValid) {
      loading.value = true
      const formData = await getFormData<KeyType>()
      // console.log(formData)

      try {
        const res = await decodeApi({
          key: formData.key
        })
        // console.log(res)
        if (res) {
          const contentType = (res as any).headers['content-type']
          if (contentType === 'application/json; charset=utf-8') {
            // 如果返回的是JSON，先检查数据类型
            if (res.data instanceof Blob) {
              // 如果数据是Blob，使用FileReader将其转换为文本
              const reader = new FileReader()
              reader.onload = function () {
                try {
                  const data = JSON.parse((reader as any).result)
                  ElMessage.error(data?.message)
                } catch (e) {
                  console.error('解析JSON出错:', e)
                }
              }
              reader.readAsText(res.data)
            } else {
              const data = JSON.parse(res.data)
              ElMessage.error(data?.message)
            }
          } else {
            // 如果返回的是文件，保存为Blob并下载
            const blob = new Blob([res.data])
            const link = document.createElement('a')
            link.href = window.URL.createObjectURL(blob)
            const filename = (res as any).headers['content-disposition'].split('filename=')[1]
            link.download = filename.slice(1, filename.length - 1) // 从响应头中获取文件名并移除引号
            link.click()
          }
        }
      } finally {
        //重置表单里面的文件列表
        const uploadEl: ComponentRef<typeof ElUpload> = await getComponentExpose('upload')
        uploadEl.clearFiles()
        loading.value = false
      }
    }
  })
}
</script>

<template>
  <ContentWrap :title="t('fileDemo.filedecode')" :message="t('fileDemo.formDes')">
    <Form
      :schema="schema"
      label-width="auto"
      :rules="rules"
      :label-position="isMobile ? 'top' : 'right'"
      @register="formRegister"
    />
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
