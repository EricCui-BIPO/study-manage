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
} from '~/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import type { Grade, GradeForm, Student } from '~/types'

definePageMeta({
  middleware: 'auth',
})

const { grades, loading, fetchGrades, createGrade, updateGrade, deleteGrade } = useGrades()
const { students: studentList, fetchStudents } = useStudents()

const searchSubject = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalPages = ref(1)
const totalCount = ref(0)

const dialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const editingGrade = ref<Grade | null>(null)
const deletingGrade = ref<Grade | null>(null)
const formLoading = ref(false)

const allStudents = ref<Student[]>([])

const defaultForm: GradeForm = {
  student_id: '',
  subject: '',
  score: 0,
  exam_type: 'midterm',
  exam_date: '',
  semester: '',
}

const form = ref<GradeForm>({ ...defaultForm })

const examTypeMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  midterm: { label: '期中考试', variant: 'default' },
  final: { label: '期末考试', variant: 'secondary' },
  quiz: { label: '测验', variant: 'outline' },
  homework: { label: '作业', variant: 'outline' },
}

const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-green-600'
  if (score >= 80) return 'text-blue-600'
  if (score >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

const loadGrades = async () => {
  const result = await fetchGrades(currentPage.value, pageSize.value, undefined, searchSubject.value || undefined)
  totalPages.value = result.pagination.totalPages
  totalCount.value = result.pagination.total
}

const loadStudents = async () => {
  const result = await fetchStudents(1, 1000)
  allStudents.value = result.data
}

const handleSearch = () => {
  currentPage.value = 1
  loadGrades()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadGrades()
}

const openCreateDialog = () => {
  editingGrade.value = null
  form.value = { ...defaultForm }
  dialogOpen.value = true
}

const openEditDialog = (grade: Grade) => {
  editingGrade.value = grade
  form.value = {
    student_id: grade.student_id,
    subject: grade.subject,
    score: grade.score,
    exam_type: grade.exam_type,
    exam_date: grade.exam_date,
    semester: grade.semester,
  }
  dialogOpen.value = true
}

const openDeleteDialog = (grade: Grade) => {
  deletingGrade.value = grade
  deleteDialogOpen.value = true
}

const handleSubmit = async () => {
  formLoading.value = true
  try {
    if (editingGrade.value) {
      await updateGrade(editingGrade.value.id, form.value)
    } else {
      await createGrade(form.value)
    }
    dialogOpen.value = false
    loadGrades()
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    formLoading.value = false
  }
}

const handleDelete = async () => {
  if (!deletingGrade.value) return
  formLoading.value = true
  try {
    await deleteGrade(deletingGrade.value.id)
    deleteDialogOpen.value = false
    loadGrades()
  } catch (error) {
    console.error('删除失败:', error)
  } finally {
    formLoading.value = false
  }
}

const getStudentName = (grade: any) => {
  return grade.students?.name || '未知'
}

const getStudentId = (grade: any) => {
  return grade.students?.student_id || '-'
}

onMounted(() => {
  loadGrades()
  loadStudents()
})
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">成绩管理</h1>
        <p class="mt-1 text-sm text-gray-500">管理学生成绩记录</p>
      </div>
      <Button @click="openCreateDialog">
        <Plus class="w-4 h-4 mr-2" />
        录入成绩
      </Button>
    </div>

    <Card>
      <CardHeader>
        <div class="flex items-center space-x-4">
          <div class="relative flex-1 max-w-sm">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              v-model="searchSubject"
              placeholder="搜索科目..."
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
              <TableHead>学生姓名</TableHead>
              <TableHead>科目</TableHead>
              <TableHead>分数</TableHead>
              <TableHead>考试类型</TableHead>
              <TableHead>学期</TableHead>
              <TableHead>考试日期</TableHead>
              <TableHead class="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="loading">
              <TableCell colspan="8" class="text-center py-8 text-gray-500">
                加载中...
              </TableCell>
            </TableRow>
            <TableRow v-else-if="grades.length === 0">
              <TableCell colspan="8" class="text-center py-8 text-gray-500">
                暂无数据
              </TableCell>
            </TableRow>
            <TableRow v-for="grade in grades" :key="grade.id">
              <TableCell class="font-medium">{{ getStudentId(grade) }}</TableCell>
              <TableCell>{{ getStudentName(grade) }}</TableCell>
              <TableCell>{{ grade.subject }}</TableCell>
              <TableCell>
                <span :class="['font-semibold', getScoreColor(grade.score)]">
                  {{ grade.score }}
                </span>
              </TableCell>
              <TableCell>
                <Badge :variant="examTypeMap[grade.exam_type]?.variant">
                  {{ examTypeMap[grade.exam_type]?.label }}
                </Badge>
              </TableCell>
              <TableCell>{{ grade.semester }}</TableCell>
              <TableCell>{{ grade.exam_date }}</TableCell>
              <TableCell class="text-right">
                <div class="flex justify-end space-x-2">
                  <Button variant="ghost" size="icon" @click="openEditDialog(grade)">
                    <Pencil class="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" @click="openDeleteDialog(grade)">
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
      <DialogContent class="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{{ editingGrade ? '编辑成绩' : '录入成绩' }}</DialogTitle>
          <DialogDescription>
            {{ editingGrade ? '修改成绩信息' : '填写学生成绩信息' }}
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="space-y-2">
            <Label for="student_id">学生</Label>
            <Select v-model="form.student_id">
              <SelectTrigger>
                <SelectValue placeholder="选择学生" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="student in allStudents"
                  :key="student.id"
                  :value="student.id"
                >
                  {{ student.name }} ({{ student.student_id }})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="subject">科目</Label>
              <Input id="subject" v-model="form.subject" required />
            </div>
            <div class="space-y-2">
              <Label for="score">分数</Label>
              <Input id="score" v-model.number="form.score" type="number" min="0" max="100" required />
            </div>
            <div class="space-y-2">
              <Label for="exam_type">考试类型</Label>
              <Select v-model="form.exam_type">
                <SelectTrigger>
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="midterm">期中考试</SelectItem>
                  <SelectItem value="final">期末考试</SelectItem>
                  <SelectItem value="quiz">测验</SelectItem>
                  <SelectItem value="homework">作业</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label for="exam_date">考试日期</Label>
              <Input id="exam_date" v-model="form.exam_date" type="date" required />
            </div>
          </div>
          <div class="space-y-2">
            <Label for="semester">学期</Label>
            <Input id="semester" v-model="form.semester" placeholder="如：2024-2025第一学期" required />
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
            确定要删除这条成绩记录吗？此操作无法撤销。
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
