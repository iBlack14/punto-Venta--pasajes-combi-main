import type { Config } from "@measured/puck";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MapPin, Calendar, Search, Clock, ShieldCheck, CreditCard, ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DropZone } from "@measured/puck";
import { PuckImageField } from "@/components/admin/puck-image-field";

// Global cache for pages to prevent infinite re-renders in Puck editor
let cachedPages: any[] | null = null;
let isFetchingPages = false;

export type PuckProps = {
    Header: {
        logoText: string;
        logoSubtext: string;
        ctaText: string;
        ctaHref: string;
        backgroundColor: string;
        textColor: string;
    };
    Footer: {
        companyName: string;
        description: string;
        address: string;
        phone: string;
        backgroundColor: string;
        textColor: string;
    };
    HeroSearch: { title: string; subtitle: string; image: string; ctaText: string };
    HeroSimple: { title: string; subtitle: string; image: string; align: "left" | "center" };
    Features: { title: string; backgroundColor?: string; textColor?: string };
    RoutesGrid: { title: string; maxItems: number; backgroundColor?: string; textColor?: string };
    Text: { content: string; align: "left" | "center" | "right" };
    Image: { src: string; alt: string; align: "left" | "center" | "right" };
    Button: { text: string; href: string; align: "left" | "center" | "right"; variant: "default" | "outline" | "ghost" };
    Section: { title: string; backgroundColor: string; padding: "small" | "medium" | "large" };
    Cards: { title: string; items: { title: string; description: string; icon: string }[]; backgroundColor?: string; textColor?: string };
    Testimonials: { title: string; items: { name: string; quote: string; role: string; avatar: string }[]; backgroundColor?: string; textColor?: string };
    FAQ: { title: string; items: { question: string; answer: string }[]; backgroundColor?: string; textColor?: string };
    Newsletter: { title: string; description: string; buttonText: string; backgroundColor?: string; textColor?: string };
};

const paddingClasses = {
    small: "py-8",
    medium: "py-16",
    large: "py-24",
};

export const config: Config<PuckProps> = {
    components: {
        Section: {
            fields: {
                title: { type: "text" },
                backgroundColor: { type: "text" },
                padding: {
                    type: "select",
                    options: [
                        { label: "Pequeño", value: "small" },
                        { label: "Medio", value: "medium" },
                        { label: "Grande", value: "large" },
                    ],
                },
            },
            defaultProps: {
                title: "",
                backgroundColor: "#ffffff",
                padding: "medium",
            },
            render: ({ title, backgroundColor, padding }) => (
                <section className={`${paddingClasses[padding]} px-4 sm:px-8`} style={{ backgroundColor }}>
                    <div className="max-w-7xl mx-auto space-y-8">
                        {title && <h2 className="text-3xl font-bold text-center text-gray-900">{title}</h2>}
                        <DropZone zone="content" />
                    </div>
                </section>
            ),
        },
        Header: {
            fields: {
                logoText: { type: "text" },
                logoSubtext: { type: "text" },
                ctaText: { type: "text" },
                ctaHref: { type: "text" },
                backgroundColor: { type: "text" },
                textColor: { type: "text" },
            },
            defaultProps: {
                logoText: "WJL",
                logoSubtext: "TURISMO",
                ctaText: "Ingresar al Portal",
                ctaHref: "/admin",
                backgroundColor: "#ffffff",
                textColor: "#111827",
            },
            render: ({ logoText, logoSubtext, ctaText, ctaHref, backgroundColor, textColor }) => {
                const [pages, setPages] = useState<any[]>(cachedPages || []);

                useEffect(() => {
                    if (cachedPages) return;
                    if (isFetchingPages) {
                        const interval = setInterval(() => {
                            if (cachedPages) {
                                setPages(cachedPages);
                                clearInterval(interval);
                            }
                        }, 100);
                        return () => clearInterval(interval);
                    }
                    isFetchingPages = true;

                    fetch("/api/site/pages")
                        .then(r => r.json())
                        .then(d => {
                            if (d?.data) {
                                cachedPages = d.data.filter((p: any) => p.status === "published" && p.slug !== "inicio");
                                setPages(cachedPages!);
                            } else {
                                cachedPages = [];
                            }
                        })
                        .catch(() => {
                            cachedPages = [];
                        })
                        .finally(() => {
                            isFetchingPages = false;
                        });
                }, []);

                return (
                    <header className="border-b shadow-sm sticky top-0 z-50 w-full" style={{ backgroundColor, color: textColor }}>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex justify-between items-center h-16">
                                <div className="flex items-center gap-2 cursor-pointer" onClick={() => typeof window !== 'undefined' && (window.location.href = '/')}>
                                    <div className="bg-blue-600 text-white p-2 rounded-lg font-bold text-xl leading-none">{logoText}</div>
                                    <span className="font-bold text-xl hidden sm:block">{logoSubtext}</span>
                                </div>
                                <nav className="flex gap-4">
                                    {pages.map((p) => (
                                        <Button
                                            key={p.slug}
                                            variant="ghost"
                                            onClick={() => typeof window !== 'undefined' && (window.location.href = `/${p.slug}`)}
                                            className="hidden sm:flex"
                                            style={{ color: "inherit" }}
                                        >
                                            {p.title}
                                        </Button>
                                    ))}
                                    <Button variant="default" className="bg-blue-600 hover:bg-blue-700" onClick={() => typeof window !== 'undefined' && (window.location.href = ctaHref)}>
                                        {ctaText}
                                    </Button>
                                </nav>
                            </div>
                        </div>
                    </header>
                )
            }
        },
        Footer: {
            fields: {
                companyName: { type: "text" },
                description: { type: "textarea" },
                address: { type: "text" },
                phone: { type: "text" },
                backgroundColor: { type: "text" },
                textColor: { type: "text" },
            },
            defaultProps: {
                companyName: "WJL TURISMO",
                description: "Empresa líder en transporte interprovincial y encomiendas. Brindamos seguridad y confort en cada viaje.",
                address: "Av. Principal 123, Huarmaca",
                phone: "+51 987 654 321",
                backgroundColor: "#111827",
                textColor: "#9ca3af",
            },
            render: ({ companyName, description, address, phone, backgroundColor, textColor }) => {
                const [pages, setPages] = useState<any[]>(cachedPages || []);

                useEffect(() => {
                    if (cachedPages) return;
                    if (isFetchingPages) {
                        const interval = setInterval(() => {
                            if (cachedPages) {
                                setPages(cachedPages);
                                clearInterval(interval);
                            }
                        }, 100);
                        return () => clearInterval(interval);
                    }
                    isFetchingPages = true;

                    fetch("/api/site/pages")
                        .then(r => r.json())
                        .then(d => {
                            if (d?.data) {
                                cachedPages = d.data.filter((p: any) => p.status === "published" && p.slug !== "inicio");
                                setPages(cachedPages!);
                            } else {
                                cachedPages = [];
                            }
                        })
                        .catch(() => {
                            cachedPages = [];
                        })
                        .finally(() => {
                            isFetchingPages = false;
                        });
                }, []);

                return (
                    <footer className="py-12 border-t w-full" style={{ backgroundColor, color: textColor, borderColor: `${textColor}33` }}>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div>
                                <div className="inline-block bg-blue-600 text-white p-2 rounded-lg font-bold text-xl leading-none mb-4">{companyName.split(' ')[0]}</div>
                                <p className="text-sm">{description}</p>
                            </div>
                            <div>
                                <h4 className="font-bold mb-4 uppercase text-sm tracking-widest text-white">Enlaces</h4>
                                <ul className="space-y-2 text-sm">
                                    <li><button onClick={() => typeof window !== 'undefined' && (window.location.href = '/')} className="hover:text-white transition-colors">Inicio</button></li>
                                    {pages.map((p) => (
                                        <li key={p.slug}><button onClick={() => typeof window !== 'undefined' && (window.location.href = `/${p.slug}`)} className="hover:text-white transition-colors">{p.title}</button></li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold mb-4 uppercase text-sm tracking-widest text-white">Legal</h4>
                                <ul className="space-y-2 text-sm">
                                    <li className="cursor-pointer hover:text-white transition-colors">Términos y Condiciones</li>
                                    <li className="cursor-pointer hover:text-white transition-colors">Políticas de Privacidad</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold mb-4 uppercase text-sm tracking-widest text-white">Contacto</h4>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {address}</li>
                                    <li className="flex items-center gap-2"> {phone}</li>
                                </ul>
                            </div>
                        </div>
                    </footer>
                )
            }
        },
        HeroSearch: {
            fields: {
                title: { type: "text" },
                subtitle: { type: "textarea" },
                image: {
                    type: "custom",
                    render: ({ value, onChange }) => <PuckImageField value={value} onChange={onChange} />
                },
                ctaText: { type: "text" },
            },
            defaultProps: {
                title: "Viaja con nosotros",
                subtitle: "Encuentra tus pasajes de la forma más rápida y segura. Compra ahora mismo.",
                image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80",
                ctaText: "Buscar Pasajes",
            },
            render: ({ title, subtitle, image, ctaText }) => {
                const options = ["Lima", "Piura", "Chiclayo", "Trujillo"];
                return (
                    <section className="relative bg-slate-900 py-20 sm:py-32 text-white overflow-hidden">
                        <div className="absolute inset-0 bg-cover bg-center opacity-40 hover:scale-105 transition-transform duration-1000 ease-in-out" style={{ backgroundImage: `url('${image}')` }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
                        <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center`}>
                            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 drop-shadow-md">{title}</h1>
                            <p className="text-lg sm:text-xl text-slate-200 mb-10 max-w-2xl mx-auto drop-shadow">{subtitle}</p>

                            <Card className="bg-white/95 backdrop-blur-sm text-gray-900 border-0 shadow-2xl max-w-5xl mx-auto rounded-2xl overflow-hidden ring-1 ring-white/20">
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-left">
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2 text-slate-700 font-semibold"><MapPin className="w-4 h-4 text-blue-600" />Origen</Label>
                                            <Select>
                                                <SelectTrigger className="bg-slate-50 border-slate-200 h-11"><SelectValue placeholder="¿De dónde sales?" /></SelectTrigger>
                                                <SelectContent>{options.map((opt) => <SelectItem key={`o-${opt}`} value={opt}>{opt}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2 text-slate-700 font-semibold"><MapPin className="w-4 h-4 text-blue-600" />Destino</Label>
                                            <Select>
                                                <SelectTrigger className="bg-slate-50 border-slate-200 h-11"><SelectValue placeholder="¿A dónde vas?" /></SelectTrigger>
                                                <SelectContent>{options.map((opt) => <SelectItem key={`d-${opt}`} value={opt}>{opt}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2 text-slate-700 font-semibold"><Calendar className="w-4 h-4 text-blue-600" />Fecha de viaje</Label>
                                            <Input type="date" className="bg-slate-50 border-slate-200 h-11" />
                                        </div>
                                        <Button type="button" className="h-11 mt-auto bg-blue-600 hover:bg-blue-700 text-base font-semibold shadow-md hover:shadow-lg transition-all">
                                            <Search className="w-4 h-4 mr-2" />
                                            {ctaText}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </section>
                )
            },
        },
        HeroSimple: {
            fields: {
                title: { type: "text" },
                subtitle: { type: "textarea" },
                image: {
                    type: "custom",
                    render: ({ value, onChange }) => <PuckImageField value={value} onChange={onChange} />
                },
                align: {
                    type: "radio",
                    options: [
                        { label: "Izquierda", value: "left" },
                        { label: "Centro", value: "center" },
                    ]
                }
            },
            defaultProps: {
                title: "Conoce nuestra empresa",
                subtitle: "Somos líderes en transporte interprovincial, brindando seguridad y confort en cada viaje.",
                image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80",
                align: "center",
            },
            render: ({ title, subtitle, image, align }) => {
                const alignClass = align === "center" ? "text-center items-center" : "text-left items-start";
                return (
                    <section className="relative bg-slate-900 py-24 sm:py-32 text-white overflow-hidden">
                        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url('${image}')` }} />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/90" />
                        <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col ${alignClass}`}>
                            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 drop-shadow-md">{title}</h1>
                            <p className="text-lg sm:text-xl text-slate-200 max-w-3xl drop-shadow leading-relaxed">{subtitle}</p>
                        </div>
                    </section>
                )
            },
        },
        Features: {
            fields: {
                title: { type: "text" },
                backgroundColor: { type: "text" },
                textColor: { type: "text" },
            },
            defaultProps: {
                title: "Nuestros Beneficios",
                backgroundColor: "#f8fafc",
                textColor: "#0f172a",
            },
            render: ({ title, backgroundColor, textColor }) => (
                <section className="py-20" style={{ backgroundColor, color: textColor }}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {title && (
                            <div className="text-center mb-16">
                                <h2 className="text-sm font-bold tracking-widest text-blue-600 uppercase mb-3">Ventajas</h2>
                                <h3 className="text-3xl md:text-4xl font-bold text-slate-900">{title}</h3>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { icon: Clock, title: "Puntualidad garantizada", desc: "Cumplimos estrictamente con nuestros horarios de salida y llegada." },
                                { icon: ShieldCheck, title: "Viajes seguros", desc: "Nuestras unidades cuentan con monitoreo GPS y mantenimiento preventivo." },
                                { icon: CreditCard, title: "Facilidad de pago", desc: "Aceptamos Yape, Plin, tarjetas y transferencias bancarias." }
                            ].map((feat, i) => (
                                <div key={i} className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        <feat.icon className="w-8 h-8" />
                                    </div>
                                    <h3 className="font-bold text-xl text-slate-900 mb-3">{feat.title}</h3>
                                    <p className="text-slate-600 leading-relaxed">{feat.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            ),
        },
        RoutesGrid: {
            fields: {
                title: { type: "text" },
                maxItems: { type: "number" },
                backgroundColor: { type: "text" },
                textColor: { type: "text" },
            },
            defaultProps: {
                title: "Rutas Frecuentes",
                maxItems: 6,
                backgroundColor: "#ffffff",
                textColor: "#0f172a",
            },
            render: ({ title, maxItems, backgroundColor, textColor }) => (
                <section className="py-20" style={{ backgroundColor, color: textColor }}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-end mb-10">
                            <div>
                                <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
                                <p className="text-slate-500 mt-2">Conectamos los principales destinos del norte</p>
                            </div>
                            <Button variant="outline" className="hidden sm:flex group">
                                Ver todas <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {[1, 2, 3, 4].slice(0, maxItems).map((r) => (
                                <div key={r} className="bg-white rounded-2xl border border-slate-200 p-6 flex justify-between items-center hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer">
                                    <div className="flex items-center gap-6">
                                        <div className="hidden sm:flex w-12 h-12 bg-slate-50 rounded-xl items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-xl text-slate-900 group-hover:text-blue-700 transition-colors flex items-center gap-2">
                                                Origen <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" /> Destino
                                            </p>
                                            <div className="flex gap-2 mt-2">
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200">Cada 30 min</Badge>
                                                <Badge variant="outline" className="text-slate-500 border-slate-200">Directo</Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-slate-500 mb-1">Desde</p>
                                        <p className="font-bold text-2xl text-blue-700">S/ 15.00</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" className="w-full mt-6 sm:hidden">
                            Ver todas las rutas
                        </Button>
                    </div>
                </section>
            ),
        },
        Cards: {
            fields: {
                title: { type: "text" },
                backgroundColor: { type: "text" },
                textColor: { type: "text" },
                items: {
                    type: "array",
                    getItemSummary: (item) => item.title || "Card",
                    arrayFields: {
                        title: { type: "text" },
                        description: { type: "textarea" },
                        icon: { type: "text" },
                    },
                },
            },
            defaultProps: {
                title: "Nuestros Servicios",
                backgroundColor: "#ffffff",
                textColor: "#0f172a",
                items: [
                    { title: "Transporte de Pasajeros", description: "Viajes diarios entre ciudades con la mayor comodidad.", icon: "users" },
                    { title: "Encomiendas", description: "Envío seguro y rápido de paquetes y documentos.", icon: "package" },
                    { title: "Turismo Privado", description: "Alquiler de unidades para viajes especiales y excursiones.", icon: "bus" },
                ],
            },
            render: ({ title, items, backgroundColor, textColor }) => (
                <section className="py-20" style={{ backgroundColor, color: textColor }}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {title && <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">{title}</h2>}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {items.map((item, i) => (
                                <Card key={i} className="border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300">
                                    <CardContent className="p-8">
                                        <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center mb-6">
                                            {/* Aquí en un entorno real usaríamos los íconos de forma dinámica */}
                                            <div className="text-2xl">⚡</div>
                                        </div>
                                        <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                                        <p className="text-slate-600">{item.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            ),
        },
        FAQ: {
            fields: {
                title: { type: "text" },
                backgroundColor: { type: "text" },
                textColor: { type: "text" },
                items: {
                    type: "array",
                    getItemSummary: (item) => item.question || "Pregunta",
                    arrayFields: {
                        question: { type: "text" },
                        answer: { type: "textarea" },
                    }
                }
            },
            defaultProps: {
                title: "Preguntas Frecuentes",
                backgroundColor: "#f8fafc",
                textColor: "#0f172a",
                items: [
                    { question: "¿Cuánto equipaje puedo llevar?", answer: "Permitimos hasta 20kg de equipaje en bodega y un bolso de mano por pasajero." },
                    { question: "¿Con cuánto tiempo de anticipación debo llegar?", answer: "Recomendamos estar 30 minutos antes de la hora de salida para realizar el embarque con tranquilidad." }
                ]
            },
            render: ({ title, items, backgroundColor, textColor }) => (
                <section className="py-20" style={{ backgroundColor, color: textColor }}>
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        {title && <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">{title}</h2>}
                        <div className="space-y-4">
                            {items.map((item, i) => (
                                <details key={i} className="group bg-white border border-slate-200 rounded-xl p-6 [&_summary::-webkit-details-marker]:hidden">
                                    <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900">
                                        {item.question}
                                        <ChevronDown className="w-5 h-5 text-slate-500 group-open:-rotate-180 transition-transform" />
                                    </summary>
                                    <p className="mt-4 text-slate-600 leading-relaxed">
                                        {item.answer}
                                    </p>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>
            )
        },
        Testimonials: {
            fields: {
                title: { type: "text" },
                backgroundColor: { type: "text" },
                textColor: { type: "text" },
                items: {
                    type: "array",
                    getItemSummary: (item) => item.name || "Testimonial",
                    arrayFields: {
                        name: { type: "text" },
                        role: { type: "text" },
                        quote: { type: "textarea" },
                        avatar: {
                            type: "custom",
                            render: ({ value, onChange }) => <PuckImageField value={value} onChange={onChange} />
                        }
                    }
                }
            },
            defaultProps: {
                title: "Lo que dicen nuestros clientes",
                backgroundColor: "#0f172a",
                textColor: "#ffffff",
                items: [
                    { name: "Juan Pérez", role: "Pasajero frecuente", quote: "Excelente servicio, siempre viajo con ellos a Piura. Muy seguro y rápido.", avatar: "https://i.pravatar.cc/150?img=11" },
                    { name: "María Sánchez", role: "Emprendedora", quote: "Envío mis encomiendas todas las semanas y siempre llegan a tiempo y en buen estado.", avatar: "https://i.pravatar.cc/150?img=5" }
                ]
            },
            render: ({ title, items, backgroundColor, textColor }) => (
                <section className="py-20" style={{ backgroundColor, color: textColor }}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {title && <h2 className="text-3xl font-bold text-center mb-16">{title}</h2>}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {items.map((item, i) => (
                                <div key={i} className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
                                    <div className="flex gap-1 mb-6 text-yellow-400">
                                        {"★★★★★"}
                                    </div>
                                    <p className="text-lg text-slate-300 italic mb-8">"{item.quote}"</p>
                                    <div className="flex items-center gap-4">
                                        <img src={item.avatar} alt={item.name} className="w-12 h-12 rounded-full bg-slate-700 object-cover" />
                                        <div>
                                            <div className="font-bold">{item.name}</div>
                                            <div className="text-sm text-slate-400">{item.role}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )
        },
        Newsletter: {
            fields: {
                title: { type: "text" },
                description: { type: "textarea" },
                buttonText: { type: "text" },
                backgroundColor: { type: "text" },
                textColor: { type: "text" },
            },
            defaultProps: {
                title: "¿Buscas ofertas de viajes?",
                description: "Suscríbete a nuestro boletín y entérate primero de promociones, nuevos horarios y rutas.",
                buttonText: "Suscribirme",
                backgroundColor: "#2563eb",
                textColor: "#ffffff",
            },
            render: ({ title, description, buttonText, backgroundColor, textColor }) => (
                <section className="py-24" style={{ backgroundColor, color: textColor }}>
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl font-bold text-white mb-4">{title}</h2>
                        <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">{description}</p>
                        <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
                            <Input type="email" placeholder="Tu correo electrónico" className="h-12 bg-white/10 text-white placeholder:text-blue-200 border-blue-400 focus:bg-white focus:text-slate-900" />
                            <Button type="button" variant="secondary" className="h-12 px-8 font-bold hover:bg-white shrink-0">
                                {buttonText}
                            </Button>
                        </form>
                    </div>
                </section>
            )
        },
        Text: {
            fields: {
                content: { type: "textarea" },
                align: {
                    type: "select",
                    options: [
                        { label: "Izquierda", value: "left" },
                        { label: "Centro", value: "center" },
                        { label: "Derecha", value: "right" },
                    ],
                },
            },
            defaultProps: {
                content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam id tellus eu ex tristique molestie. Curabitur vel dictum lectus. Aliquam id neque ut magna auctor sodales et a mauris.",
                align: "left",
            },
            render: ({ content, align }) => {
                const alignClass = align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";
                return (
                    <div className={`py-6 px-4`}>
                        <div className={`max-w-4xl mx-auto text-slate-700 whitespace-pre-wrap leading-relaxed ${alignClass}`}>
                            {content}
                        </div>
                    </div>
                );
            },
        },
        Image: {
            fields: {
                src: {
                    type: "custom",
                    render: ({ value, onChange }) => <PuckImageField value={value} onChange={onChange} />
                },
                alt: { type: "text" },
                align: {
                    type: "select",
                    options: [
                        { label: "Izquierda", value: "left" },
                        { label: "Centro", value: "center" },
                        { label: "Derecha", value: "right" },
                    ],
                },
            },
            defaultProps: {
                src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80",
                alt: "Imagen Descriptiva",
                align: "center",
            },
            render: ({ src, alt, align }) => {
                const alignClass = align === "center" ? "mx-auto" : align === "right" ? "ml-auto" : "mr-auto";
                return (
                    <div className={`py-6 px-4`}>
                        <div className={`max-w-5xl mx-auto flex`}>
                            <img src={src} alt={alt} className={`${alignClass} rounded-2xl shadow-lg max-w-full`} />
                        </div>
                    </div>
                );
            },
        },
        Button: {
            fields: {
                text: { type: "text" },
                href: { type: "text" },
                variant: {
                    type: "select",
                    options: [
                        { label: "Primario", value: "default" },
                        { label: "Secundario", value: "outline" },
                        { label: "Fantasma", value: "ghost" }
                    ]
                },
                align: {
                    type: "select",
                    options: [
                        { label: "Izquierda", value: "left" },
                        { label: "Centro", value: "center" },
                        { label: "Derecha", value: "right" },
                    ],
                },
            },
            defaultProps: {
                text: "Click aquí",
                href: "/",
                align: "center",
                variant: "default"
            },
            render: ({ text, href, align, variant }) => {
                const alignClass = align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";
                return (
                    <div className={`py-6 px-4`}>
                        <div className={alignClass}>
                            <Button
                                variant={variant}
                                className={variant === "default" ? "bg-blue-600 hover:bg-blue-700 h-11 px-8 rounded-full shadow-md" : "h-11 px-8 rounded-full"}
                                onClick={() => {
                                    if (typeof window !== 'undefined') window.location.href = href;
                                }}
                            >
                                {text}
                            </Button>
                        </div>
                    </div>
                );
            },
        },
    },
};
