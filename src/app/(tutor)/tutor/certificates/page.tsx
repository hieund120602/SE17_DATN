'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Upload, 
  Trash2, 
  FileText, 
  ExternalLink, 
  Award,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import TutorService from '@/services/tutor-service';
import { toast } from '@/hooks/use-toast';

export default function TutorCertificatesPage() {
  const [certificates, setCertificates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deleteUrl, setDeleteUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const data = await TutorService.getCertificates();
      setCertificates(data);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách chứng chỉ',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Lỗi',
          description: 'Chỉ hỗ trợ file JPG, PNG hoặc PDF',
          variant: 'destructive'
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Lỗi',
          description: 'Kích thước file không được vượt quá 5MB',
          variant: 'destructive'
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      await TutorService.uploadCertificate(selectedFile);
      
      toast({
        title: 'Thành công',
        description: 'Đã tải lên chứng chỉ thành công',
      });

      setSelectedFile(null);
      loadCertificates();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải lên chứng chỉ',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteUrl) return;

    try {
      await TutorService.deleteCertificate(deleteUrl);
      
      toast({
        title: 'Thành công',
        description: 'Đã xóa chứng chỉ thành công',
      });

      setDeleteUrl(null);
      loadCertificates();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa chứng chỉ',
        variant: 'destructive'
      });
    }
  };

  const getCertificateName = (url: string) => {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename.length > 30 ? filename.substring(0, 30) + '...' : filename;
  };

  const getCertificateType = (url: string) => {
    if (url.includes('.pdf')) return 'PDF';
    if (url.includes('.jpg') || url.includes('.jpeg')) return 'JPG';
    if (url.includes('.png')) return 'PNG';
    return 'Unknown';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản Lý Chứng Chỉ</h1>
          <p className="text-gray-600">Tải lên và quản lý các chứng chỉ của bạn</p>
        </div>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Tải Lên Chứng Chỉ Mới
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="certificate">Chọn file chứng chỉ</Label>
            <Input
              id="certificate"
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            <p className="text-xs text-gray-500">
              Hỗ trợ JPG, PNG, PDF (tối đa 5MB)
            </p>
          </div>

          {selectedFile && (
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-blue-900">{selectedFile.name}</p>
                <p className="text-sm text-blue-600">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button 
                onClick={handleUpload} 
                disabled={uploading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {uploading ? 'Đang tải...' : 'Tải lên'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certificates List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Danh Sách Chứng Chỉ ({certificates.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {certificates.length === 0 ? (
            <div className="text-center py-8">
              <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có chứng chỉ nào
              </h3>
              <p className="text-gray-500">
                Hãy tải lên chứng chỉ đầu tiên của bạn để xây dựng hồ sơ giảng viên chuyên nghiệp.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {certificates.map((certUrl, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">{getCertificateName(certUrl)}</p>
                        <p className="text-xs text-gray-500">{getCertificateType(certUrl)}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setPreviewUrl(certUrl)}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh]">
                          <DialogHeader>
                            <DialogTitle>Xem Chứng Chỉ</DialogTitle>
                            <DialogDescription>
                              {getCertificateName(certUrl)}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex justify-center">
                            {previewUrl && getCertificateType(previewUrl) === 'PDF' ? (
                              <iframe
                                src={previewUrl}
                                className="w-full h-96 border rounded"
                                title="Certificate Preview"
                              />
                            ) : (
                              <img
                                src={previewUrl || ''}
                                alt="Certificate"
                                className="max-w-full max-h-96 object-contain"
                              />
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setDeleteUrl(certUrl)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-xs">Đã xác thực</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Hướng Dẫn
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-gray-600 space-y-2">
            <p>• <strong>Định dạng hỗ trợ:</strong> JPG, PNG, PDF (tối đa 5MB)</p>
            <p>• <strong>Chất lượng:</strong> Hình ảnh rõ nét, đọc được các thông tin quan trọng</p>
            <p>• <strong>Nội dung:</strong> Chứng chỉ liên quan đến giảng dạy, ngôn ngữ học, giáo dục</p>
            <p>• <strong>Xác thực:</strong> Admin sẽ xem xét và xác thực các chứng chỉ của bạn</p>
            <p>• <strong>Bảo mật:</strong> Chứng chỉ của bạn được lưu trữ an toàn và chỉ hiển thị khi cần thiết</p>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteUrl} onOpenChange={() => setDeleteUrl(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa chứng chỉ</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa chứng chỉ này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}