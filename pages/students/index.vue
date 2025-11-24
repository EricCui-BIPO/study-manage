<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Badge } from '~/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import type { Student, StudentForm } from '~/types'

definePageMeta({
  middleware: 'auth',
})

const { students, loading, fetchStudents, createStudent, updateStudent, deleteStudent } = useStudents()

const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalPages = ref(1)
const totalCount = ref(0)

const dialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const editingStudent = ref<Student | null>(null)
const deletingStudent = ref<Student | null>(null)
const formLoading = ref(false)

const defaultForm: StudentForm = {
  student_id: '',
  name: '',
  gender: 'male',
  birth_date: '',
  phone: '',
  email: '',
  address: '',
  class_name: '',
  enrollment_date: '',
  status: 'active',
}

const form = ref<StudentForm>({ ...defaultForm })

const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  active: { label: '在校', variant: 'default' },
  graduated: { label: '已毕业', variant: 'secondary' },
  suspended: { label: '休学', variant: 'outline' },
  transferred: { label: '已转学', variant: 'destructive' },
}

const genderMap: Record<string, string> = {
  male: '男',
  female: '女',
}

const loadStudents = async () => {
  const result = await fetchStudents(currentPage.value, pageSize.value, searchQuery.value)
  totalPages.value = result.pagination.totalPages
  totalCount.value = result.pagination.total
}

const handleSearch = () => {
  currentPage.value = 1
  loadStudents()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadStudents()
}

const openCreateDialog = () => {
  editingStudent.value = null
  form.value = { ...defaultForm }
  dialogOpen.value = true
}

const openEditDialog = (student: Student) => {
  editingStudent.value = student
  form.value = {
    student_id: student.student_id,
    name: student.name,
    gender: student.gender,
    birth_date: student.birth_date,
    phone: student.phone || '',
    email: student.email || '',
    address: student.address || '',
    class_name: student.class_name,
    enrollment_date: student.enrollment_date,
    status: student.status,
  }
  dialogOpen.value = true
}

const openDeleteDialog = (student: Student) => {
  deletingStudent.value = student
  deleteDialogOpen.value = true
}

const handleSubmit = async () => {
  formLoading.value = true
  try {
    if (editingStudent.value) {
      await updateStudent(editingStudent.value.id, form.value)
    } else {
      await createStudent(form.value)
    }
    dialogOpen.value = false
    loadStudents()
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    formLoading.value = false
  }
}

const handleDelete = async () => {
  if (!deletingStudent.value) return
  formLoading.value = true
  try {
    await deleteStudent(deletingStudent.value.id)
    deleteDialogOpen.value = false
    loadStudents()
  } catch (error) {
    console.error('删除失败:', error)
  } finally {
    formLoading.value = false
  }
}

onMounted(() => {
  loadStudents()
})
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">学生管理</h1>
        <p class="mt-1 text-sm text-gray-500">管理所有学生信息</p>
      </div>
      <Button @click="openCreateDialog">
        <Plus class="w-4 h-4 mr-2" />
        添加学生
      </Button>
    </div>

    <Card>
      <CardHeader>
        <div class="flex items-center space-x-4">
          <div class="relative flex-1 max-w-sm">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              v-model="searchQuery"
              placeholder="搜索学生姓名或学号..."
              class="pl-10"
              @keyup.enter="handleSearch"
            />
          </div>
          <Button variant="outline" @click="handleSearch">搜索</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>学号</TableHead>
              <TableHead>姓名</TableHead>
              <TableHead>性别</TableHead>
              <TableHead>班级</TableHead>
              <TableHead>入学日期</TableHead>
              <TableHead>状态</TableHead>
              <TableHead class="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="loading">
              <TableCell colspan="7" class="text-center py-8 text-gray-500">
                加载中...
              </TableCell>
            </TableRow>
            <TableRow v-else-if="students.length === 0">
              <TableCell colspan="7" class="text-center py-8 text-gray-500">
                暂无数据
              </TableCell>
            </TableRow>
            <TableRow v-for="student in students" :key="student.id">
              <TableCell class="font-medium">{{ student.student_id }}</TableCell>
              <TableCell>{{ student.name }}</TableCell>
              <TableCell>{{ genderMap[student.gender] }}</TableCell>
              <TableCell>{{ student.class_name }}</TableCell>
              <TableCell>{{ student.enrollment_date }}</TableCell>
              <TableCell>
                <Badge :variant="statusMap[student.status]?.variant">
                  {{ statusMap[student.status]?.label }}
                </Badge>
              </TableCell>
              <TableCell class="text-right">
                <div class="flex justify-end space-x-2">
                  <Button variant="ghost" size="icon" @click="openEditDialog(student)">
                    <Pencil class="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" @click="openDeleteDialog(student)">
                    <Trash2 class="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <!-- Pagination -->
        <div class="flex items-center justify-between mt-4">
          <div class="text-sm text-gray-500">
            共 {{ totalCount }} 条记录
          </div>
          <div class="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              :disabled="currentPage <= 1"
              @click="handlePageChange(currentPage - 1)"
            >
              <ChevronLeft class="w-4 h-4" />
            </Button>
            <span class="text-sm">
              第 {{ currentPage }} / {{ totalPages }} 页
            </span>
            <Button
              variant="outline"
              size="sm"
              :disabled="currentPage >= totalPages"
              @click="handlePageChange(currentPage + 1)"
            >
              <ChevronRight class="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Create/Edit Dialog -->
    <Dialog v-model:open="dialogOpen">
      <DialogContent class="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{{ editingStudent ? '编辑学生' : '添加学生' }}</DialogTitle>
          <DialogDescription>
            {{ editingStudent ? '修改学生信息' : '填写学生基本信息' }}
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="student_id">学号</Label>
              <Input id="student_id" v-model="form.student_id" required />
            </div>
            <div class="space-y-2">
              <Label for="name">姓名</Label>
              <Input id="name" v-model="form.name" required />
            </div>
            <div class="space-y-2">
              <Label for="gender">性别</Label>
              <Select v-model="form.gender">
                <SelectTrigger>
                  <SelectValue placeholder="选择性别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">男</SelectItem>
                  <SelectItem value="female">女</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label for="birth_date">出生日期</Label>
              <Input id="birth_date" v-model="form.birth_date" type="date" required />
            </div>
            <div class="space-y-2">
              <Label for="phone">电话</Label>
              <Input id="phone" v-model="form.phone" />
            </div>
            <div class="space-y-2">
              <Label for="email">邮箱</Label>
              <Input id="email" v-model="form.email" type="email" />
            </div>
            <div class="space-y-2">
              <Label for="class_name">班级</Label>
              <Input id="class_name" v-model="form.class_name" required />
            </div>
            <div class="space-y-2">
              <Label for="enrollment_date">入学日期</Label>
              <Input id="enrollment_date" v-model="form.enrollment_date" type="date" required />
            </div>
            <div class="space-y-2">
              <Label for="status">状态</Label>
              <Select v-model="form.status">
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">在校</SelectItem>
                  <SelectItem value="graduated">已毕业</SelectItem>
                  <SelectItem value="suspended">休学</SelectItem>
                  <SelectItem value="transferred">已转学</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div class="space-y-2">
            <Label for="address">地址</Label>
            <Input id="address" v-model="form.address" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" @click="dialogOpen = false">
              取消
            </Button>
            <Button type="submit" :disabled="formLoading">
              {{ formLoading ? '保存中...' : '保存' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Delete Dialog -->
    <Dialog v-model:open="deleteDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>确认删除</DialogTitle>
          <DialogDescription>
            确定要删除学生 "{{ deletingStudent?.name }}" 吗？此操作无法撤销。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="deleteDialogOpen = false">
            取消
          </Button>
          <Button variant="destructive" :disabled="formLoading" @click="handleDelete">
            {{ formLoading ? '删除中...' : '确认删除' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
