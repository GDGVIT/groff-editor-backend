.TL
My first groff doc
.AU
John Doe
.AI
University of ____
.AS
Abstract
.AB 
Abstract !!!!
.AE
This is an abstract
.PP
This is a para
.NH
Introduction to paragraphs
.PP
Para is here
and here
and here

new para(without indent)
.PP
para (with indent)
 to paragraphs
.NH
Second section
.NH 2
Sub-section
.NH 2
Another sub-section
.PP
starts 

.SH 
Formatting
.PP 
text which is
.B "bold" ). (
 to paragraphs
.I "Italic"
.BI "Bold italic"
.RS
.B "bold" ). (  
to paragraphs                                                
.I "Italic"                          
.BI "Bold italic"
.RE
.B "bold" ). (
to paragraphs
.I "Italic"
.BI "Bold italic"
.B "bold" ). (
to paragraphs                               
.I "Italic"                     
.BI "Bold italic"


.UL
This is underlined text
.BX
This is boxed text


.SH
Macros
.IP
Item1
.IP \(bu
Item2
.IP
Item3 \(bu 2

.de BL
.IP \(bu 2
..

.SH
Here is a break
.BL
Bulletted item!!


