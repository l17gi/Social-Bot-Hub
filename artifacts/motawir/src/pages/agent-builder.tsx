import { useGetAgentApps } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Plus, Settings2, Globe, Cpu, FileText, BarChart3, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function AgentBuilder() {
  const { data: agents, isLoading } = useGetAgentApps();

  const getToolIcon = (tool: string) => {
    switch (tool) {
      case 'web_search': return <Globe className="w-3 h-3" />;
      case 'code_exec': return <Cpu className="w-3 h-3" />;
      case 'file_ops': return <FileText className="w-3 h-3" />;
      case 'data_analysis': return <BarChart3 className="w-3 h-3" />;
      case 'image_gen': return <ImageIcon className="w-3 h-3" />;
      default: return <Settings2 className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
          <Bot className="w-8 h-8 text-primary" />
          منشئ الوكلاء
        </h2>
        <Button className="bg-gradient-to-r from-primary to-purple-600 text-white font-bold">
          <Plus className="w-4 h-4 ml-2" /> وكيل جديد
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
             <div key={i} className="h-64 bg-card/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {agents?.map((agent, i) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full bg-card/40 backdrop-blur-md border-border/50 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all flex flex-col group">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Bot className="w-6 h-6" />
                    </div>
                    <Badge variant={agent.isPublic ? "default" : "secondary"}>
                      {agent.isPublic ? 'عام' : 'خاص'}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl mt-4">{agent.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{agent.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">النموذج المستخدم</p>
                      <Badge variant="outline" className="bg-background/50 border-primary/20 text-primary">
                        {agent.model}
                      </Badge>
                    </div>
                    
                    {agent.tools && agent.tools.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">الأدوات</p>
                        <div className="flex flex-wrap gap-2">
                          {agent.tools.map(tool => (
                            <Badge key={tool} variant="secondary" className="bg-secondary/10 text-secondary-foreground text-xs flex items-center gap-1">
                              {getToolIcon(tool)} {tool}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 flex gap-2">
                    <Button variant="outline" className="w-full flex-1 border-primary/30 hover:bg-primary/10 hover:text-primary">
                      تعديل
                    </Button>
                    <Button variant="default" className="flex-1 bg-primary/20 text-primary hover:bg-primary hover:text-white">
                      استخدام
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
