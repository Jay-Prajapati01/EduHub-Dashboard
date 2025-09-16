import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Plus,
  FileText,
  Video,
  Link,
  Download,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Upload,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface CourseMaterialsProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Array<{
    id: string;
    title: string;
  }>;
}

interface Material {
  id: string;
  title: string;
  description: string;
  type: string;
  courseId: string;
  courseName: string;
  fileUrl?: string;
  content?: string;
  createdAt: string;
}

export default function CourseMaterials({ isOpen, onClose, courses }: CourseMaterialsProps) {
  const { token } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newMaterialForm, setNewMaterialForm] = useState({
    title: "",
    description: "",
    type: "",
    courseId: "",
    content: "",
    fileUrl: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchMaterials();
    }
  }, [isOpen]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/teacher/materials", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Mock materials with course names
        const materialsWithCourses = data.materials.map((material: any) => ({
          ...material,
          courseName: courses.find(c => c.id === material.courseId)?.title || 'Unknown Course'
        }));
        setMaterials(materialsWithCourses);
      } else {
        console.error("Failed to fetch materials");
      }
    } catch (error) {
      console.error("Error fetching materials:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMaterial = async () => {
    if (!newMaterialForm.title || !newMaterialForm.type || !newMaterialForm.courseId) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch("/api/teacher/materials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newMaterialForm),
      });

      if (response.ok) {
        const result = await response.json();
        const selectedCourseData = courses.find(c => c.id === newMaterialForm.courseId);
        
        const newMaterial = {
          ...result.material,
          courseName: selectedCourseData?.title || 'Unknown Course'
        };
        
        setMaterials([newMaterial, ...materials]);
        
        setNewMaterialForm({
          title: "",
          description: "",
          type: "",
          courseId: "",
          content: "",
          fileUrl: "",
        });
        
        setShowAddDialog(false);
        alert(`Material "${newMaterialForm.title}" created successfully!`);
      } else {
        const error = await response.json();
        alert(`Error creating material: ${error.message}`);
      }
    } catch (error) {
      console.error("Error creating material:", error);
      alert("Failed to create material. Please try again.");
    }
  };

  const handleDeleteMaterial = async (materialId: string, materialTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${materialTitle}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/teacher/materials/${materialId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMaterials(materials.filter(m => m.id !== materialId));
        alert("Material deleted successfully!");
      } else {
        alert("Failed to delete material");
      }
    } catch (error) {
      console.error("Error deleting material:", error);
      alert("Error deleting material");
    }
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case "document":
        return <FileText className="w-5 h-5" />;
      case "video":
        return <Video className="w-5 h-5" />;
      case "link":
        return <Link className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  const getMaterialColor = (type: string) => {
    switch (type) {
      case "document":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "video":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "link":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-orange-600 bg-orange-50 border-orange-200";
    }
  };

    const filteredMaterials = selectedCourse && selectedCourse !== 'all' 
    ? materials.filter(m => m.courseId === selectedCourse)
    : materials;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-semibold text-slate-900">Course Materials</span>
              <p className="text-sm text-slate-600 font-normal mt-1">
                Manage and organize course resources for your students
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 max-w-xs">
              <Label htmlFor="course-filter" className="text-sm font-medium text-slate-700 mb-2 block">
                Filter by Course
              </Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="All courses" />
                </SelectTrigger>
                                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Material
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Course Material</DialogTitle>
                  <DialogDescription>
                    Create a new material resource for your students.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="material-title">Title *</Label>
                      <Input
                        id="material-title"
                        placeholder="Material title"
                        value={newMaterialForm.title}
                        onChange={(e) => setNewMaterialForm({...newMaterialForm, title: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="material-course">Course *</Label>
                      <Select
                        value={newMaterialForm.courseId}
                        onValueChange={(value) => setNewMaterialForm({...newMaterialForm, courseId: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="material-type">Type *</Label>
                    <Select
                      value={newMaterialForm.type}
                      onValueChange={(value) => setNewMaterialForm({...newMaterialForm, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="document">Document/PDF</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="link">External Link</SelectItem>
                        <SelectItem value="note">Study Notes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="material-description">Description</Label>
                    <Input
                      id="material-description"
                      placeholder="Brief description"
                      value={newMaterialForm.description}
                      onChange={(e) => setNewMaterialForm({...newMaterialForm, description: e.target.value})}
                    />
                  </div>
                  
                  {newMaterialForm.type === "link" ? (
                    <div className="space-y-2">
                      <Label htmlFor="material-url">URL *</Label>
                      <Input
                        id="material-url"
                        placeholder="https://example.com"
                        value={newMaterialForm.fileUrl}
                        onChange={(e) => setNewMaterialForm({...newMaterialForm, fileUrl: e.target.value})}
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="material-content">Content</Label>
                      <Textarea
                        id="material-content"
                        placeholder="Enter material content or notes..."
                        value={newMaterialForm.content}
                        onChange={(e) => setNewMaterialForm({...newMaterialForm, content: e.target.value})}
                        className="min-h-[100px]"
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateMaterial} className="bg-orange-600 hover:bg-orange-700">
                    Create Material
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Materials List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
              <p className="mt-4 text-slate-600">Loading materials...</p>
            </div>
          ) : filteredMaterials.length === 0 ? (
            <Card className="border-slate-200">
              <CardContent className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-medium mb-2">No materials found</p>
                <p className="text-sm text-slate-500 mb-4">
                  {selectedCourse ? "No materials for this course" : "Create your first course material"}
                </p>
                <Button onClick={() => setShowAddDialog(true)} className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Material
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMaterials.map((material) => (
                <Card key={material.id} className="border-slate-200 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getMaterialColor(material.type)}`}>
                          {getMaterialIcon(material.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-900 truncate">{material.title}</h4>
                          <p className="text-xs text-slate-600">{material.courseName}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-8 h-8 p-0 hover:bg-slate-100"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-8 h-8 p-0 hover:bg-red-100 text-red-600"
                          onClick={() => handleDeleteMaterial(material.id, material.title)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {material.description && (
                        <p className="text-sm text-slate-600 line-clamp-2">{material.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <Badge variant="outline" className={getMaterialColor(material.type)}>
                          {material.type}
                        </Badge>
                        <span>{new Date(material.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      {material.type === "link" && material.fileUrl ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => window.open(material.fileUrl, '_blank')}
                        >
                          <Link className="w-4 h-4 mr-2" />
                          Open Link
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="w-full">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
