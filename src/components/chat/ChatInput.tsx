import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, X, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileAttachment {
  name: string;
  url: string;
  type: string;
  size: number;
  preview?: string;
}

interface ChatInputProps {
  onSendMessage: (message: string, attachments?: FileAttachment[]) => void;
  disabled?: boolean;
}

// Helper function to convert file to base64
const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((message.trim() || attachments.length > 0) && !disabled && !isUploading) {
      onSendMessage(message.trim(), attachments);
      setMessage('');
      setAttachments([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    for (const file of Array.from(files)) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB`,
          variant: "destructive"
        });
        continue;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type`,
          variant: "destructive"
        });
        continue;
      }

      try {
        // Convert file to base64 data URL
        const base64Url = await convertFileToBase64(file);
        
        const attachment: FileAttachment = {
          name: file.name,
          url: base64Url, // Now this is a proper data URL that can be sent to the edge function
          type: file.type,
          size: file.size,
          preview: file.type.startsWith('image/') ? base64Url : undefined
        };
        
        setAttachments(prev => [...prev, attachment]);

        toast({
          title: "File attached",
          description: `${file.name} attached successfully`,
        });
      } catch (error) {
        console.error('Attachment error:', error);
        toast({
          title: "Attachment failed",
          description: `Failed to attach ${file.name}`,
          variant: "destructive"
        });
      }
    }

    setIsUploading(false);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => {
      const newAttachments = [...prev];
      newAttachments.splice(index, 1);
      return newAttachments;
    });
  };

  return (
    <div className="border-t border-border p-4">
      {/* File attachments preview */}
      {attachments.length > 0 && (
        <div className="mb-3 p-3 bg-accent/50 rounded-lg">
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment, idx) => (
              <div key={idx} className="relative group">
                {attachment.preview ? (
                  <div className="relative">
                    <img 
                      src={attachment.preview} 
                      alt={attachment.name}
                      className="h-20 w-20 object-cover rounded-lg border"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeAttachment(idx)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-background border rounded-lg p-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm truncate max-w-[150px]">{attachment.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(idx)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {attachments.length} file(s) attached
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask AquaBot anything about marine aquariums..."
            disabled={disabled || isUploading}
            className="min-h-[60px] max-h-[150px] resize-none pr-12 text-base"
            rows={1}
          />
          <div className="absolute right-2 top-2 flex gap-1">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 relative"
              disabled={disabled || isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Paperclip className="h-4 w-4" />
                  {attachments.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                      {attachments.length}
                    </span>
                  )}
                </>
              )}
            </Button>
          </div>
        </div>
        <Button
          type="submit"
          disabled={(!message.trim() && attachments.length === 0) || disabled || isUploading}
          className="h-[60px] w-[60px] p-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};
