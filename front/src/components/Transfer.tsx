import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ethers } from "ethers";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Loader, Loader2 } from "lucide-react";


export function Transfer(){
    const[tx, setTx] = useState <object|null> (null);
    const [loading, setLoading] = useState(false);


    const form= useForm({
        defaultValues: {
            from: "0xC49807c3C4b32Cb0290599AF5b53b3724aed7eBD",
            to: "0xe0fa3AB82068b8BE514F75179182b7409b1dA51C",
            amount: 1,
        },
    });
    const onSubmit = async (data: any) => {
        setLoading(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner(data.from);
        const t = await signer.sendTransaction({
            to: data.to,
            value: ethers.parseEther(data.amount.toString()),
        });
        const tx = await t.wait();
        setTx({tx, t, data});
        setLoading(false);
    };


    return (
        <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Transfers</h1>
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField control={form.control} name="from" render={({ field }) => (
                <FormItem className="flex flex-col w-1/4">
                    <FormLabel className="font-medium">Cuenta origen</FormLabel>
                    <FormControl>
                        <Input placeholder="0xc3de456..." {...field} className="w-full" />
                    </FormControl>
                </FormItem>
            )} />
        
            <FormField control={form.control} name="to" render={({ field }) => (
                <FormItem className="flex flex-col w-1/4">
                    <FormLabel className="font-medium">Cuenta destino</FormLabel>
                    <FormControl>
                        <Input placeholder="0xc3de456..." {...field} className="w-full" />
                    </FormControl>
                </FormItem>
            )} />

            <FormField control={form.control} name="amount" render={({ field }) => (
                        <FormItem className="flex flex-col w-1/4">
                            <FormLabel className="font-medium">Cantidad</FormLabel>
                            <FormControl>
                                <Input placeholder="" {...field} className="w-full" />
                            </FormControl>
                        </FormItem>
            )} />

            <Button type="submit" className="flex items-center gap-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Transferir
            </Button>
        </form>
        </Form>
        
        {loading && (
        <div className="flex items-center gap-2 text-blue-600 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Por favor espere mientras se realiza la operación...</span>
        </div>
        )}

        {tx && (
            <div className="bg-gray-100 p-4 rounded-md mt-4">    
                <h2 className="text-lg font-semibold">Transacción completa</h2>
                <code className="block text-sm text-gray-800 whitespace-pre-wrap">
                    {JSON.stringify(tx, null, 4)}
                </code>
            </div>
        )}
       
    </div>);
}