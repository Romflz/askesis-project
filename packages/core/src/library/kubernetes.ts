import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

const sh = (...lines: string[]) => code('bash', ...lines)
const yaml = (...lines: string[]) => code('yaml', ...lines)

const CARDS: CardContent[] = [
  // Workloads
  {
    front: 'What is a Pod?',
    back: 'The smallest deployable unit: one or more containers that share a network namespace (one IP) and volumes, and are scheduled together on one node',
  },
  {
    front: 'Deployment',
    back: 'Keeps a set of identical Pods running through ReplicaSets, with rolling updates and rollbacks',
    extra: 'The usual choice for stateless apps.',
  },
  {
    front: 'ReplicaSet',
    back: 'Keeps a specified number of Pod replicas running; normally managed by a Deployment rather than created directly',
  },
  {
    front: 'StatefulSet',
    back: 'For stateful apps: Pods get stable names (`db-0`, `db-1`), start in order and each keep their own PersistentVolumeClaim',
  },
  {
    front: 'DaemonSet',
    back: 'Runs one copy of a Pod on every node, or on selected nodes, e.g. log collectors and monitoring agents',
  },
  {
    front: 'Job vs CronJob',
    back: 'A Job runs Pods until a task completes successfully; a CronJob creates Jobs on a cron schedule',
  },
  {
    front: 'Init containers',
    back: 'Run to completion, one after another, before the app containers start',
    extra: 'Typical uses: waiting for a dependency, running migrations, fetching configuration.',
  },
  // Networking
  {
    front: 'What does a Service do?',
    back: 'Gives a set of Pods, chosen by a label selector, a stable virtual IP and DNS name, and load-balances traffic across them',
  },
  {
    front: 'The four Service types',
    back: '`ClusterIP` (the default, internal only), `NodePort` (a port on every node), `LoadBalancer` (an external cloud load balancer), `ExternalName` (a DNS CNAME)',
  },
  { front: 'Default NodePort range', back: '30000–32767' },
  {
    front: 'Headless Service',
    back: 'A Service with `clusterIP: None`: DNS returns the Pod IPs directly instead of one virtual IP',
    extra: 'StatefulSets use one to give each Pod its own DNS name.',
  },
  {
    front: 'A Service’s DNS name inside the cluster',
    back: '`<service>.<namespace>.svc.cluster.local`',
    extra: 'From the same namespace, the bare service name works.',
  },
  {
    front: 'Ingress',
    back: 'Rules that route HTTP and HTTPS traffic to Services by host name and path; it does nothing without an ingress controller running in the cluster',
    extra: 'The newer Gateway API is its more expressive successor.',
  },
  {
    front: 'NetworkPolicy',
    back: 'Rules for which traffic may reach or leave Pods, selected by labels, namespaces or IP ranges',
    extra: 'Only enforced if the cluster’s network plugin supports it, as Calico and Cilium do.',
  },
  // Configuration and storage
  {
    front: 'ConfigMap vs Secret',
    back: 'Both inject configuration as environment variables or files; Secrets hold sensitive data but are only base64-encoded by default, not encrypted',
    extra: 'Turn on encryption at rest and limit who can read Secrets with RBAC.',
  },
  {
    front: 'Namespace',
    back: 'A scope for names, resource quotas and access control inside a cluster',
    extra: 'Built in: `default`, `kube-system`, `kube-public` and `kube-node-lease`.',
  },
  {
    front: 'Labels vs annotations',
    back: 'Labels are identifying key-value pairs that selectors match on; annotations hold non-identifying metadata for tools and people',
  },
  {
    front: 'PersistentVolume vs PersistentVolumeClaim',
    back: 'A PV is a piece of storage in the cluster; a PVC is a request for storage that binds to a matching PV and is mounted by Pods',
  },
  { front: 'StorageClass', back: 'Describes a kind of storage and lets PVCs provision PersistentVolumes dynamically, on demand' },
  {
    front: 'Volume access modes',
    back: '`ReadWriteOnce` (one node), `ReadOnlyMany`, `ReadWriteMany` and `ReadWriteOncePod` (a single Pod)',
  },
  // Health and resources
  { front: 'Liveness probe', back: 'When it fails, the kubelet restarts the container' },
  {
    front: 'Readiness probe',
    back: 'While it fails, the Pod is taken out of Service endpoints and gets no traffic; the container isn’t restarted',
  },
  {
    front: 'Startup probe',
    back: 'Holds off liveness and readiness checks until it succeeds, so slow-starting apps aren’t killed during startup',
  },
  {
    front: 'An HTTP liveness probe in a container spec',
    back: yaml(
      'livenessProbe:',
      '  httpGet:',
      '    path: /healthz',
      '    port: 8080',
      '  initialDelaySeconds: 5',
      '  periodSeconds: 10',
    ),
    extra: 'Probes can also use `tcpSocket`, `exec` or `grpc`.',
  },
  {
    front: 'Resource requests vs limits',
    back: 'Requests are what the scheduler reserves for a container on a node; limits are the most it may use',
    extra: 'Over its memory limit a container is OOM-killed; over its CPU limit it is throttled.',
  },
  {
    front: 'The three Pod QoS classes',
    back: '`Guaranteed` (every container has CPU and memory requests equal to limits), `Burstable` (some requests or limits set), `BestEffort` (none set)',
    extra: 'Under memory pressure, BestEffort Pods are evicted first.',
  },
  {
    front: 'HorizontalPodAutoscaler',
    back: 'Scales a workload’s replica count up and down based on metrics such as CPU utilization',
    extra: 'It needs the metrics API, usually provided by metrics-server.',
  },
  {
    front: 'Rolling update settings of a Deployment',
    back: '`maxSurge` (extra Pods allowed during the update) and `maxUnavailable` (Pods that may be down), both 25% by default',
  },
  // Architecture and scheduling
  {
    front: 'Control plane components',
    back: '`kube-apiserver`, `etcd`, `kube-scheduler` and `kube-controller-manager`, plus `cloud-controller-manager` in cloud clusters',
  },
  {
    front: 'etcd',
    back: 'The consistent, distributed key-value store that holds all cluster state',
    extra: 'Back it up: losing etcd means losing the cluster’s configuration.',
  },
  { front: 'kubelet', back: 'The agent on each node that makes sure the containers in its Pods are running and healthy' },
  {
    front: 'kube-proxy',
    back: 'Runs on each node and programs the network rules (iptables, IPVS or nftables) that make Services work',
  },
  {
    front: 'kube-scheduler',
    back: 'Assigns each new Pod to a node, based on resource requests, affinity rules, and taints and tolerations',
  },
  {
    front: 'Taints and tolerations',
    back: 'A taint on a node repels Pods unless they have a matching toleration',
    extra: sh('kubectl taint nodes node1 gpu=true:NoSchedule'),
  },
  {
    front: 'nodeSelector vs node affinity',
    back: 'Both attract Pods to nodes with certain labels; `nodeSelector` is a simple exact match, while affinity adds operators and required or preferred rules',
  },
  // Troubleshooting and access
  {
    front: 'CrashLoopBackOff',
    back: 'A container keeps crashing, and the kubelet restarts it with an increasing delay, up to five minutes',
    extra: 'Start with `kubectl logs --previous` and `kubectl describe pod`.',
  },
  {
    front: 'ImagePullBackOff',
    back: 'The node can’t pull the image: a wrong name or tag, a private registry without credentials, or a network problem',
  },
  {
    front: 'Role vs ClusterRole',
    back: 'A Role grants permissions in one namespace; a ClusterRole is cluster-wide or reusable across namespaces',
    extra: 'Grant them with a RoleBinding or a ClusterRoleBinding.',
  },
  { front: 'ServiceAccount', back: 'The identity that processes in a Pod use to call the Kubernetes API' },
  // kubectl
  {
    front: 'List Pods with their node and IP address',
    back: sh('kubectl get pods -o wide'),
    extra: 'Add `-A` for every namespace, or `-w` to watch for changes.',
  },
  { front: 'See a Pod’s events and why it isn’t starting', back: sh('kubectl describe pod web-7d4b9c') },
  {
    front: 'Show the logs of a container’s previous, crashed run',
    back: sh('kubectl logs web-7d4b9c --previous'),
    extra: '`-c name` picks a container in a multi-container Pod; `-f` follows new output.',
  },
  { front: 'Open a shell inside a running Pod', back: sh('kubectl exec -it web-7d4b9c -- sh') },
  { front: 'Create or update resources from a manifest', back: sh('kubectl apply -f deployment.yaml') },
  {
    front: 'Watch a rollout, then roll it back',
    back: sh('kubectl rollout status deployment/web', 'kubectl rollout undo deployment/web'),
  },
  { front: 'Scale a Deployment to five replicas', back: sh('kubectl scale deployment web --replicas=5') },
  { front: 'Reach a Service from your machine without exposing it', back: sh('kubectl port-forward svc/web 8080:80') },
  {
    front: 'Generate a Deployment manifest without creating anything',
    back: sh('kubectl create deployment web --image=nginx --dry-run=client -o yaml > web.yaml'),
  },
  {
    front: 'List cluster contexts and switch to another',
    back: sh('kubectl config get-contexts', 'kubectl config use-context staging'),
  },
  {
    front: 'Empty a node safely before maintenance',
    back: sh('kubectl drain node1 --ignore-daemonsets'),
    extra: 'Then `kubectl uncordon node1` lets Pods be scheduled there again.',
  },
]

export const KUBERNETES: PublicDeck = {
  slug: 'kubernetes-essentials',
  title: 'Kubernetes essentials: 50 core objects and kubectl commands',
  shortTitle: 'Kubernetes',
  category: 'devops',
  level: 'intermediate',
  icon: 'code',
  description:
    'Kubernetes fundamentals for developers and CKA or CKAD candidates: Pods, Deployments, Services, storage, probes, resources and scheduling, plus the kubectl commands you use daily.',
  intro:
    'From what a Pod is to why one is stuck in CrashLoopBackOff: the core objects, how the control plane fits together, health probes, resource requests and limits, and the kubectl commands for inspecting, rolling out and debugging workloads.',
  faq: [
    {
      q: 'Do I need to know Docker first?',
      a: 'It helps. Kubernetes runs containers built from images, so the Docker deck is a good warm-up.',
    },
    {
      q: 'Is this enough for the CKA or CKAD exam?',
      a: 'No. Both exams are hands-on. This deck makes the concepts and commands automatic, so your practice time in a real cluster goes further.',
    },
    {
      q: 'What is the difference between liveness and readiness probes?',
      a: 'A failing liveness probe restarts the container; a failing readiness probe only stops traffic to the Pod until it passes again.',
    },
  ],
  cards: CARDS,
}
