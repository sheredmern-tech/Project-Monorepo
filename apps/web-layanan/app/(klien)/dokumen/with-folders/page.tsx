'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { dokumenApi } from '@/lib/api/dokumen';
import { perkaraApi, Perkara } from '@/lib/api/perkara';
import { FolderTree } from '@/components/dokumen/FolderTree';
import { CreateFolderModal } from '@/components/dokumen/CreateFolderModal';
import {
  FileText,
  Upload,
  Loader2,
  AlertCircle,
  RefreshCw,
  FolderOpen,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function DokumenWithFoldersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // States
  const [perkaraList, setPerkaraList] = useState<Perkara[]>([]);
  const [selectedPerkara, setSelectedPerkara] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateFolder, setShowCreateFolder] = useState(false);

  // Load perkara list
  useEffect(() => {
    loadPerkara();
  }, []);

  // Load documents when folder changes
  useEffect(() => {
    if (selectedPerkara) {
      loadDocuments();
    }
  }, [selectedPerkara, currentFolder]);

  const loadPerkara = async () => {
    try {
      const response = await perkaraApi.getAll({ limit: 100 });
      setPerkaraList(response.data);
      if (response.data.length > 0) {
        setSelectedPerkara(response.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load perkara:', err);
    }
  };

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await dokumenApi.getAll({
        perkara_id: selectedPerkara!,
        // Note: Backend doesn't have folder_id filter yet,
        // but this shows the UI pattern
        limit: 100,
      });
      setDocuments(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = (folderId: string | null) => {
    setCurrentFolder(folderId);
  };

  const handleFolderCreated = () => {
    // Reload to show new folder
    loadDocuments();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dokumen Saya</h1>
              <p className="text-muted-foreground mt-1">
                Kelola dokumen dalam folder yang terorganisir
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push('/dokumen/upload')}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
              >
                <Upload className="h-4 w-4" />
                Upload
              </button>
              <button
                onClick={loadDocuments}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-accent transition"
              >
                <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Folder Sidebar */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FolderOpen className="h-4 w-4" />
                  Folders
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedPerkara ? (
                  <FolderTree
                    perkaraId={selectedPerkara}
                    currentFolderId={currentFolder}
                    onFolderClick={handleFolderClick}
                    onCreateFolder={() => setShowCreateFolder(true)}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Select a perkara to view folders
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Documents List */}
          <div className="md:col-span-3">
            {/* Perkara Selector */}
            {perkaraList.length > 0 && (
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Select Perkara
                    </label>
                    <select
                      value={selectedPerkara || ''}
                      onChange={(e) => setSelectedPerkara(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {perkaraList.map((perkara) => (
                        <option key={perkara.id} value={perkara.id}>
                          {perkara.nomor_perkara} - {perkara.judul}
                        </option>
                      ))}
                    </select>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Breadcrumb */}
            {currentFolder && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <button
                  onClick={() => setCurrentFolder(null)}
                  className="hover:text-foreground"
                >
                  All Documents
                </button>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground">Current Folder</span>
              </div>
            )}

            {/* Error */}
            {error && (
              <Card className="mb-6 border-destructive">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Documents */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : documents.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No documents in this {currentFolder ? 'folder' : 'perkara'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {documents.map((doc) => (
                  <Card
                    key={doc.id}
                    className="hover:shadow-md transition cursor-pointer"
                    onClick={() => router.push(`/dokumen/${doc.id}`)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <FileText className="h-6 w-6 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{doc.nama_dokumen}</h3>
                          <p className="text-sm text-muted-foreground">
                            {doc.kategori} • {new Date(doc.tanggal_upload).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Folder Modal */}
      {showCreateFolder && selectedPerkara && (
        <CreateFolderModal
          perkaraId={selectedPerkara}
          parentId={currentFolder}
          onClose={() => setShowCreateFolder(false)}
          onSuccess={handleFolderCreated}
        />
      )}
    </div>
  );
}
