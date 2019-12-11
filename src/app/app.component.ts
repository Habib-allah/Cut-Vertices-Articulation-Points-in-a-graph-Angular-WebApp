import { Component , OnInit,ViewChild,ElementRef} from '@angular/core';
import { Network, DataSet, Node, Edge, IdType, Data } from 'vis';

declare var vis:any;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild("mynetwork") networkContainer: ElementRef;

  constructor() { }

    public nodes: DataSet<Node>;
    public edges: DataSet <Edge>;
    public network : Network;
    public data:{
      nodes:DataSet<Node>,
      edges: DataSet<Edge>
    };

    matchIds:any[];
    visited:boolean[];
    nb;

    async findCutVertices(){
      for(var i=0;i<this.nodes.get().length;i++){
        this.nodes.update({
          id:this.nodes.get()[i].id,
          color:{background:'#666666'}
        })
      }

      await this.matchingIds();
      this.nb= await this.connectedComponents(this.nodes,0);//ZERO TO SAY THERE IS NO NODE TO DELETE
      //console.log(this.nb)

      var newNb;
      var cutVertices=[];
      for(var i=0; i<this.nodes.get().length;i++){
        var currentNode=this.nodes.get()[i].id;
        newNb= await this.connectedComponents(this.nodes,currentNode);
        if(newNb>this.nb){
          cutVertices.push(currentNode);
        }
      } 
      console.log(cutVertices);
      this.updateColors(cutVertices);
    }

    

    matchingIds(){//JUST TO MAP A TYPEID WITH THE VISITED INDEXES
      var i=0;
      this.matchIds=[]

      this.nodes.forEach((n,id)=>{
        this.matchIds[i++]=id;
      })

    }

    async connectedComponents(nodes:DataSet<Node>,deletedId){
      //INTIALIZE VISITED ARRAY
      this.visited=new Array(nodes.length)
      for(var i=0;i<this.visited.length;i++) this.visited[i]=false
      
      //THIS BLOCK IS USED TO IGNORE THE DELETED NODE IF IT EXISTS
      var index=0; //TO STORE THE INDEX OF NODE 
      if ((index=this.getIndexById(deletedId))!=-1){
        this.visited[index]=true;//INORDER TO IGNORE IT
      }

      var nb=0; //Number of connected components
      for(var i=0; i<nodes.get().length;i++){
        var id=nodes.get()[i].id
        index=await this.getIndexById(id);
        if (!this.visited[index]) {
          await this.DFS(id);
          nb++;
          }
        }
      return nb;  
      }
    
    async DFS(id){
      var index= await this.getIndexById(id);//find the index of an element by its id:mapping
      this.visited[index]=true;
      
      
      var adj=this.network.getConnectedNodes(id);

      for(var i=0;i<adj.length;i++){
        index =await this.getIndexById(adj[i]);

        if (!this.visited[index]) await this.DFS(adj[i]);//Recursive Call 
      }
    }

    getIndexById(id){
      for (var i=0;i<this.matchIds.length;i++){
        if (this.matchIds[i]==id) return (i)
      }
    }

    updateColors(cutVertices:IdType[]){
      for(var i=0;i<cutVertices.length;i++){
        this.nodes.update({
          id:cutVertices[i],
          color:{background:'#FFFFFF'}
        })
      }
    }

    public ngAfterViewInit(): void {

          this.nodes = new vis.DataSet([
           /*  {id: 1, label: 'Node 1'},
              {id: 2, label: 'Node 2'},
              {id: 3, label: 'Node 3'},
              {id: 4, label: 'Node 4'},
              {id: 5, label: 'Node 5'} */
          ])

            this.edges =new vis.DataSet([
             /*  {from: 1, to: 3},
              {from: 1, to: 2},
              {from: 2, to: 4},
              {from: 2, to: 5} */
            ]);
           // create a network
           var container = this.networkContainer.nativeElement;

           this.data = {
            nodes: this.nodes,
            edges: this.edges
          };
          var opt = {
              nodes: {
                borderWidth:4,
                size:30,
                shape: 'circularImage', 
                image: "",
              color: {
                  border: '#222222',
                  background: '#666666'
                },
                font:{
                  size:0, //A WORKAROUND LOL, JUST TO DISABLE LABELS (I DONT LIKE 'EM)
                  color:'#eeeeee'}
              },
              edges: {
                color: 'lightgray'
              },
            manipulation: {
              enabled: true
            }
          };
           this.network = new vis.Network(container, this.data, opt);
    }  
}
