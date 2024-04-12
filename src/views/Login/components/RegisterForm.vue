<script setup lang="tsx">
import { Form, FormSchema } from '@/components/Form'
import { reactive, ref } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { useForm } from '@/hooks/web/useForm'
import { ElButton, ElInput, FormRules, ElMessage } from 'element-plus'
import { useValidator } from '@/hooks/web/useValidator'

const emit = defineEmits(['to-login'])

const { formRegister, formMethods } = useForm()
const { getElFormExpose } = formMethods

const { t } = useI18n()

const { required } = useValidator()

// 定义发送验证码的函数
const statusMsg = ref('获取验证码')
const emailloading = ref(false)
const emailable = ref(false)
const sendVerificationCode = async () => {
  try {
    emailloading.value = true
    emailable.value = true
    statusMsg.value = '验证码发送中...'
    // 在这里调用你的API来发送验证码
    // await yourApi.sendVerificationCode()
    emailloading.value = false
    ElMessage.success('发送成功，验证码有效期5分钟')
    let count = 60
    let timerid = setInterval(() => {
      if (count <= 0) {
        clearInterval(timerid)
        emailable.value = false
        statusMsg.value = '获取验证码'
      } else {
        statusMsg.value = `${count--}秒后重新发送`
      }
    }, 1000)
  } catch (error) {
    console.error(error)
    emailloading.value = false
    emailable.value = false
    statusMsg.value = '获取验证码'
  }
}

const schema = reactive<FormSchema[]>([
  {
    field: 'title',
    colProps: {
      span: 24
    },
    formItemProps: {
      slots: {
        default: () => {
          return <h2 class="text-2xl font-bold text-center w-[100%]">{t('login.register')}</h2>
        }
      }
    }
  },
  {
    field: 'username',
    label: t('login.username'),
    value: '',
    component: 'Input',
    colProps: {
      span: 24
    },
    componentProps: {
      placeholder: t('login.usernamePlaceholder')
    }
  },
  {
    field: 'password',
    label: t('login.password'),
    value: '',
    component: 'InputPassword',
    colProps: {
      span: 24
    },
    componentProps: {
      style: {
        width: '100%'
      },
      strength: true,
      placeholder: t('login.passwordPlaceholder')
    }
  },
  {
    field: 'check_password',
    label: t('login.checkPassword'),
    value: '',
    component: 'InputPassword',
    colProps: {
      span: 24
    },
    componentProps: {
      style: {
        width: '100%'
      },
      strength: true,
      placeholder: t('login.passwordPlaceholder')
    }
  },
  {
    field: 'email',
    label: t('login.email'),
    colProps: {
      span: 24
    },
    formItemProps: {
      slots: {
        default: (formData) => {
          return (
            <div class="w-[100%] flex">
              <ElInput
                class="w-[50%]"
                v-model={formData.code}
                placeholder={t('login.emailPlaceholder')}
              />
              <ElButton
                class="w-[50%]"
                type="primary"
                loading={emailloading.value}
                onClick={sendVerificationCode}
                disabled={emailable.value}
                round
              >
                {statusMsg.value}
              </ElButton>
            </div>
          )
        }
      }
    }
  },
  {
    field: 'code',
    label: t('login.code'),
    colProps: {
      span: 24
    },
    formItemProps: {
      slots: {
        default: (formData) => {
          return (
            <div class="w-[100%] flex">
              <ElInput v-model={formData.code} placeholder={t('login.codePlaceholder')} />
            </div>
          )
        }
      }
    }
  },
  {
    field: 'register',
    colProps: {
      span: 24
    },
    formItemProps: {
      slots: {
        default: () => {
          return (
            <>
              <div class="w-[100%]">
                <ElButton
                  type="primary"
                  class="w-[100%]"
                  loading={loading.value}
                  onClick={loginRegister}
                >
                  {t('login.register')}
                </ElButton>
              </div>
              <div class="w-[100%] mt-15px">
                <ElButton class="w-[100%]" onClick={toLogin}>
                  {t('login.hasUser')}
                </ElButton>
              </div>
            </>
          )
        }
      }
    }
  }
])

const rules: FormRules = {
  username: [required()],
  password: [required()],
  check_password: [required()],
  code: [required()]
}

const toLogin = () => {
  emit('to-login')
}

const loading = ref(false)

const loginRegister = async () => {
  const formRef = await getElFormExpose()
  formRef?.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true
        toLogin()
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<template>
  <Form
    :schema="schema"
    :rules="rules"
    label-position="top"
    hide-required-asterisk
    size="large"
    class="dark:(border-1 border-[var(--el-border-color)] border-solid)"
    @register="formRegister"
  />
</template>
